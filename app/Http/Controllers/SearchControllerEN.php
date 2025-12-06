<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Anime;
use App\Models\Episode;

class SearchControllerEN extends Controller
{
    public function index(Request $request)
    {
        $q = $request->input('q');

        $animes = Anime::where('title', 'like', "%{$q}%")
                        ->select('id', 'title', 'image')
                        ->take(5)
                        ->get();

        $episodes = Episode::where('title_en', 'like', "%{$q}%")
                           ->select('id', 'title_en', 'episode_number', 'thumbnail')
                           ->take(5)
                           ->get();

        return response()->json([
            'searchResults' => [
                'animes' => $animes,
                'episodes' => $episodes,
            ]
        ]);
    }
}
