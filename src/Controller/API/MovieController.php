<?php

namespace App\Controller\API;

use App\Entity\Movie;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Translation\Exception\NotFoundResourceException;

/**
 * @Route("/api/movie", name="api_movie_")
 */
class MovieController extends AbstractController
{
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("/search/{name}", name="search", methods={"GET"})
     */
    public function checkUsername($name)
    {
        try {
            $client = HttpClient::create();

            $response = $client->request('GET', 'https://api.themoviedb.org/3/search/movie', [
                'query' => [
                    'api_key' => $this->getParameter('app.tmdb.id'),
                    'language' => 'fr-FR',
                    'query' => $name,
                ],
            ]);

            $content = $response->toArray();

            return $this->json($content['results'], 200);
        } catch (NotFoundResourceException $e) {
            return $this->json($e, 404);
        }
    }
}
