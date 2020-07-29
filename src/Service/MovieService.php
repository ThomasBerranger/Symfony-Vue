<?php

namespace App\Service;

use App\Entity\Movie;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\Security\Core\Security;

class MovieService
{
    public function __construct(Security $security, EntityManagerInterface $entityManager, ParameterBagInterface $parameterBag)
    {
        $this->security = $security;
        $this->entityManager = $entityManager;
        $this->parameterBag = $parameterBag;
    }

    public function getMovieTimeline()
    {
        $client = HttpClient::create();
        $movies = [];

        $currentUserTimeline = $this->entityManager->getRepository(Movie::class)->findBy(['viewer' => $this->security->getUser()]);

        /**
         * @var integer $key
         * @var Movie $movie
         */
        foreach ($currentUserTimeline as $key => $movie) {

            $response = $client->request('GET', 'https://api.themoviedb.org/3/movie/'.$movie->getTmdbId(), [
                'query' => [
                    'api_key' => $this->parameterBag->get('app.tmdb.id'),
                    'language' => 'fr-FR',
                ],
            ]);

            $content = $response->toArray();

            $movies[$key] = [
                'createdAt' => $movie->getCreatedAt(),
                'title' => $content['title'],
                'overview' => $content['overview'],
                'genres' => $content['genres'],
            ];
        }

        rsort($movies);

        return json_encode($movies);
    }
}