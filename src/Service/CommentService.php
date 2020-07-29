<?php

namespace App\Service;

use App\Entity\Comment;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Security\Core\Security;

class CommentService
{
    public function __construct(Security $security, EntityManagerInterface $entityManager, ParameterBagInterface $parameterBag)
    {
        $this->security = $security;
        $this->entityManager = $entityManager;
        $this->parameterBag = $parameterBag;
    }

    public function getComment(User $user, $tmdbId)
    {
        $comment = $this->entityManager->getRepository(Comment::class)->findOneBy(['author' => $user, 'tmdbId' => $tmdbId]);

        return $comment ? $comment->getContent() : null;
    }
}