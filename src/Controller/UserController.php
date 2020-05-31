<?php

namespace App\Controller;

use App\Entity\Movie;
use App\Entity\User;
use App\Service\MovieService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/user", name="user_")
 */
class UserController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager, MovieService $movieService)
    {
        $this->entityManager = $entityManager;
        $this->movieService = $movieService;
    }

    /**
     * @Route("/me", name="show")
     */
    public function show()
    {
        $movieTimeline = $this->movieService->getMovieTimeline();

        return $this->render('user/show.html.twig', [
            'movieTimeline' => $movieTimeline
        ]);
    }

    /**
     * @Route("/edit/me", name="edit")
     */
    public function edit()
    {
        return $this->render('user/edit.html.twig');
    }
}
