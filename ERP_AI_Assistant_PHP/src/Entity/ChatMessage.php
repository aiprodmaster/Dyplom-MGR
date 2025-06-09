<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\ChatMessageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

#[ORM\Entity(repositoryClass: ChatMessageRepository::class)]
#[ORM\Table(name: 'chat_messages')]
#[ORM\Index(columns: ['created_at'], name: 'idx_chat_messages_created_at')]
#[ORM\Index(columns: ['message_type'], name: 'idx_chat_messages_type')]
class ChatMessage
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidInterface $id;

    #[ORM\ManyToOne(targetEntity: ChatSession::class, inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?ChatSession $session = null;

    #[ORM\Column(length: 20)]
    private string $messageType; // 'user', 'assistant', 'system'

    #[ORM\Column(type: Types::TEXT)]
    private string $content;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $metadata = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 4, scale: 3, nullable: true)]
    private ?string $confidence = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $tokensUsed = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $model = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $responseTimeMs = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $ragSources = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $wasRagUsed = false;

    public function __construct()
    {
        $this->id = Uuid::uuid4();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function getSession(): ?ChatSession
    {
        return $this->session;
    }

    public function setSession(?ChatSession $session): static
    {
        $this->session = $session;
        return $this;
    }

    public function getMessageType(): string
    {
        return $this->messageType;
    }

    public function setMessageType(string $messageType): static
    {
        $this->messageType = $messageType;
        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;
        return $this;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function setMetadata(?array $metadata): static
    {
        $this->metadata = $metadata;
        return $this;
    }

    public function getConfidence(): ?string
    {
        return $this->confidence;
    }

    public function setConfidence(?string $confidence): static
    {
        $this->confidence = $confidence;
        return $this;
    }

    public function getTokensUsed(): ?int
    {
        return $this->tokensUsed;
    }

    public function setTokensUsed(?int $tokensUsed): static
    {
        $this->tokensUsed = $tokensUsed;
        return $this;
    }

    public function getModel(): ?string
    {
        return $this->model;
    }

    public function setModel(?string $model): static
    {
        $this->model = $model;
        return $this;
    }

    public function getResponseTimeMs(): ?int
    {
        return $this->responseTimeMs;
    }

    public function setResponseTimeMs(?int $responseTimeMs): static
    {
        $this->responseTimeMs = $responseTimeMs;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getRagSources(): ?array
    {
        return $this->ragSources;
    }

    public function setRagSources(?array $ragSources): static
    {
        $this->ragSources = $ragSources;
        return $this;
    }

    public function getWasRagUsed(): bool
    {
        return $this->wasRagUsed;
    }

    public function setWasRagUsed(bool $wasRagUsed): static
    {
        $this->wasRagUsed = $wasRagUsed;
        return $this;
    }

    public function isUserMessage(): bool
    {
        return $this->messageType === 'user';
    }

    public function isAssistantMessage(): bool
    {
        return $this->messageType === 'assistant';
    }

    public function isSystemMessage(): bool
    {
        return $this->messageType === 'system';
    }
}
