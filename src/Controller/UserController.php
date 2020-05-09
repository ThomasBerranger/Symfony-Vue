<?php

namespace App\Controller;

use App\Entity\Movie;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/user")
 */
class UserController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("/", name="user")
     */
    public function index()
    {
        return $this->render('user/index.html.twig', [
            'controller_name' => 'UserController',
        ]);
    }

    /**
     * @Route("/me", name="user_show")
     */
    public function show()
    {

        return $this->render('user/show.html.twig');
    }


    /**
     * @Route("/watch/{id}", name="user_watch", methods={"POST"})
     */
    public function watch(Request $request, SerializerInterface $serializer)
    {
        $json = $request->getContent();

        try {
        $movie = $serializer->deserialize($json, Movie::class, 'json');
        $user = $this->getUser();

        $movie->setUser($user);
        $this->entityManager->persist($movie);
        $this->entityManager->flush();

        return $this->json($movie, 201, [], ['groups' => 'movie:read']);
        } catch (NotEncodableValueException $e) {
            return $this->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
