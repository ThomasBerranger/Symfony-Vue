<?php

namespace App\Controller\API;

use App\Entity\Movie;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Translation\Exception\NotFoundResourceException;

/**
 * @Route("/api/user", name="api_user_")
 */
class UserController extends AbstractController
{
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("/", name="edit", methods={"PUT"})
     */
    public function edit(Request $request, SerializerInterface $serializer)
    {
        $json = $request->getContent();

        try {
            $user = $serializer->deserialize($json, User::class, 'json', ['object_to_populate' => $this->getUser()]);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $this->json($user, 201, [], ['groups' => 'user:read']);
        } catch (NotEncodableValueException $e) {
            return $this->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * @Route("/watch", name="watch", methods={"POST"})
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

    /**
     * @Route("/check_username/{username}", name="check_username", methods={"GET"})
     */
    public function checkUsername($username)
    {
        try {
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['username' => $username]);

            if ($user and $user != $this->getUser()) {
                return $this->json([
                    'isAlreadyUsed' => true,
                ], 200);
            } else {
                return $this->json([
                    'isAlreadyUsed' => false,
                ], 200);
            }
        } catch (NotFoundResourceException $e) {
            return $this->json($e, 404);
        }
    }

    /**
     * @Route("/preference/{attribut}/{value}", name="preference", methods={"GET"})
     */
    public function preference($attribut, $value)
    {
        try {
            $user = $this->getUser();

            switch ($attribut) {
                case 'adultContent':
                    $user->setAdultContent($value);
                    break;
                case 'theme':
                    $user->setTheme($value);
                    break;
            }

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $this->json($user, 201, [], ['groups' => 'user:read']);
        } catch (NotFoundResourceException $e) {
            return $this->json($e, 404);
        }
    }

    /**
     * @Route("/", name="list", methods={"GET"})
     * @Route("/{username}", name="search", methods={"GET"})
     */
    public function list($username = null)
    {
        if ($username == null) {
            $users = $this->entityManager->getRepository(User::class)->findAll();
        } else {
            $users = $this->entityManager->getRepository(User::class)->findByUsername($username);
        }

        return $this->json($users, 200, [], ['groups' => 'user:read']);
    }
}
