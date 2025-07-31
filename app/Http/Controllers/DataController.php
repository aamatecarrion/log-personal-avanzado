<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Record;
use App\Models\Image;
use App\Models\ImageProcessingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use ZipArchive;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class DataController extends Controller
{
    public function index()
    {
        return inertia('data.index');
    }

    public function export()
    {
        $user = Auth::user();

        $records = Record::with('image.image_processing_jobs')->where('user_id', $user->id)->get();

        $favorites = Favorite::where('user_id', $user->id)->get(['title', 'created_at', 'updated_at']);

        $tempDir = storage_path('app/export_temp');
        Storage::deleteDirectory('export_temp');
        mkdir($tempDir);
        mkdir("$tempDir/images");

        file_put_contents("$tempDir/data.json", json_encode($records, JSON_PRETTY_PRINT));

        foreach ($records as $record) {
            if ($record->image && $record->image->image_path) {
                $source = storage_path("app/private/" . $record->image->image_path);
                $dest = "$tempDir/images/" . basename($record->image->image_path);
                if (file_exists($source)) {
                    copy($source, $dest);
                }
            }
        }

        file_put_contents("$tempDir/favorites.json", json_encode($favorites, JSON_PRETTY_PRINT));

        $zip = new ZipArchive;
        $zipPath = storage_path('app/export.zip');
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($tempDir),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($tempDir) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }

        $zip->close();

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }

    public function import(Request $request)
    {
        $request->validate([
            'archivo_zip' => 'required|file|mimes:zip',
        ]);

        $user = Auth::user();

        // Guardar y extraer zip
        $zipPath = $request->file('archivo_zip')->storeAs('import', 'temp.zip');
        $extractPath = storage_path('app/import_temp');
        Storage::deleteDirectory('import_temp');
        mkdir($extractPath);

        $zip = new ZipArchive;
        if ($zip->open(storage_path("app/$zipPath")) !== true) {
            return back()->withErrors(['archivo_zip' => 'No se pudo abrir el archivo ZIP']);
        }
        $zip->extractTo($extractPath);
        $zip->close();

        // Leer records
        $jsonPath = "$extractPath/data.json";
        $favoritesPath = "$extractPath/favorites.json";

        DB::beginTransaction();

        try {
            // Importar records
            if (file_exists($jsonPath)) {
                $data = json_decode(file_get_contents($jsonPath), true);

                foreach ($data as $recordData) {
                    $record = Record::where('user_id', $user->id)
                        ->where('title', $recordData['title'])
                        ->where('created_at', $recordData['created_at'])
                        ->first();
                        if (!$record) {
                            $record = new Record([
                                'user_id' => $user->id,
                                'title' => $recordData['title'],
                                'description' => $recordData['description'],
                                'latitude' => $recordData['latitude'],
                                'longitude' => $recordData['longitude'],
                            ]);
                            $record->timestamps = false;
                            $record->created_at = Carbon::parse($recordData['created_at']);
                            $record->updated_at = Carbon::parse($recordData['updated_at']);
                            $record->saveQuietly();
                        }

                    // Importar imagen si existe
                    if (!empty($recordData['image'])) {
                        $imageData = $recordData['image'];

                        $image = Image::where('record_id', $record->id)->first();

                        if (!$image) {
                            // Copiar imagen física
                            $filename = basename($imageData['image_path']);
                            $sourcePath = "$extractPath/images/$filename";
                            $newPath = "images/" . uniqid() . "_$filename";

                            if (file_exists($sourcePath) && !Storage::disk('private')->exists($newPath)) {
                                Storage::disk('private')->put($newPath, file_get_contents($sourcePath));
                            }

                            $image = new Image([
                                'record_id' => $record->id,
                                'original_filename' => $imageData['original_filename'],
                                'image_path' => $newPath,
                                'file_date' => !empty($imageData['file_date']) ? Carbon::parse($imageData['file_date']) : null,
                                'file_latitude' => $imageData['file_latitude'],
                                'file_longitude' => $imageData['file_longitude'],
                                'generated_description' => $imageData['generated_description'],
                            ]);
                            $image->timestamps = false;
                            $image->created_at = Carbon::parse($imageData['created_at']);
                            $image->updated_at = Carbon::parse($imageData['updated_at']);
                            $image->saveQuietly();
                        }

                        // Importar jobs
                        foreach ($imageData['image_processing_jobs'] ?? [] as $jobData) {
                            $job = ImageProcessingJob::where('image_id', $image->id)
                                ->where('type', $jobData['type'])
                                ->where('created_at', $jobData['created_at'])
                                ->first();

                            if (!$job) {
                                $job = new ImageProcessingJob([
                                    'image_id' => $image->id,
                                    'type' => $jobData['type'],
                                    'status' => $jobData['status'],
                                    'queued_at' => !empty($jobData['queued_at']) ? Carbon::parse($jobData['queued_at']) : null,
                                    'started_at' => !empty($jobData['started_at']) ? Carbon::parse($jobData['started_at']) : null,
                                    'finished_at' => !empty($jobData['finished_at']) ? Carbon::parse($jobData['finished_at']) : null,
                                    'error' => $jobData['error'],
                                ]);
                                $job->timestamps = false;
                                $job->created_at = Carbon::parse($jobData['created_at']);
                                $job->updated_at = Carbon::parse($jobData['updated_at']);
                                $job->saveQuietly();
                            }
                        }
                    }
                }
            }

            // Importar favoritos
            if (file_exists($favoritesPath)) {
                $favoritesData = json_decode(file_get_contents($favoritesPath), true);

                foreach ($favoritesData as $favData) {
                    $fav = Favorite::where('user_id', $user->id)
                        ->where('title', $favData['title'])
                        ->where('created_at', $favData['created_at'])
                        ->first();

                    if (!$fav) {
                        $fav = new Favorite([
                            'user_id' => $user->id,
                            'title' => $favData['title'],
                        ]);
                        $fav->timestamps = false;
                        $fav->created_at = Carbon::parse($favData['created_at']);
                        $fav->updated_at = Carbon::parse($favData['updated_at']);
                        $fav->saveQuietly();
                    }
                }
            }

            DB::commit();

            return back()->with('success', 'Datos importados correctamente');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al importar: ' . $e->getMessage()]);
        }
    }
}
