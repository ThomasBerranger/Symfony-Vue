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
    public function __construct(Security $security, EntityManagerInterface $entityManager, ParameterBagInterface $parameterBag, CommentService $commentService)
    {
        $this->security = $security;
        $this->entityManager = $entityManager;
        $this->parameterBag = $parameterBag;
        $this->commentService = $commentService;
    }

    public function getMovieTimeline()
    {
        $client = HttpClient::create();
        $timeline = [];

        $currentUserWatchedMovies = $this->entityManager->getRepository(Movie::class)->findBy(['viewer' => $this->security->getUser()]);

        $movies = array_merge($currentUserWatchedMovies, $this->getFriendWatchedMovies());

        /**
         * @var integer $key
         * @var Movie $movie
         */
        foreach ($movies as $movie) {

            $response = $client->request('GET', 'https://api.themoviedb.org/3/movie/'.$movie->getTmdbId(), [
                'query' => [
                    'api_key' => $this->parameterBag->get('app.tmdb.id'),
                    'language' => 'fr-FR',
                ],
            ]);

            $content = $response->toArray();

            $timeline[$movie->getId()] = [
                'viewer' => $movie->getViewer()->getUsername(),
                'comment' => $this->commentService->getComment($movie->getViewer(), $movie->getTmdbId()),
                'createdAt' => $movie->getCreatedAt(),
                'title' => $content['title'],
                'overview' => $content['overview'],
                'genres' => $content['genres'],
            ];
        }

        krsort($timeline);

        return json_encode(array_values($timeline));
    }
    
    private function getFriendWatchedMovies() 
    {
        $movies = [];
        
        foreach ($this->security->getUser()->getFriends() as $friend) {
            foreach ($friend->getWatchedMovies() as $movie) {
                array_push($movies, $movie);
            }
        }
        
        return $movies;
    }
}