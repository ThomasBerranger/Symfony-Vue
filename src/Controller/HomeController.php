<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    /**
     * @Route("/", name="home")
     */
    public function index()
    {
        $client = HttpClient::create();

        $response = $client->request('GET', 'https://api.themoviedb.org/3/trending/movie/week', [
            'query' => [
                'api_key' => $this->getParameter('app.tmdb.id'),
            ],
        ]);

        $content = $response->toArray();

        return $this->render('movie/trending.html.twig', [
            'trendingMovies' => $content['results'],
        ]);
    }
}
