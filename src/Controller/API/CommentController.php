<?php

namespace App\Controller\API;

use App\Entity\Comment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/api/comment", name="api_comment_")
 */
class CommentController extends AbstractController
{
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("/new", name="new", methods={"POST"})
     */
    public function new(Request $request, SerializerInterface $serializer)
    {
        $json = $request->getContent();

        try {
            $comment = $serializer->deserialize($json, Comment::class, 'json');

            $comment->setAuthor($this->getUser());
            $this->entityManager->persist($comment);
            $this->entityManager->flush();

            return $this->json($comment, 201, [], ['groups' => 'comment:read']);
        } catch (NotEncodableValueException $e) {
            return $this->json([
                'status' => 400,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
