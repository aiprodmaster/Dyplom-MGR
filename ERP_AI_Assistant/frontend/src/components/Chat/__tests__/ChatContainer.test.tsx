// src/components/Chat/__tests__/ChatContainer.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatContainer from '../ChatContainer';
import { RAGResponse } from '../../../types/assistant.types';

// Mock environment config
jest.mock('../../../config/environment.config', () => ({
  ENV_CONFIG: {
    API_BASE_URL: 'http://localhost:3001',
  },
}));

// Mock CSS import
jest.mock('../ChatContainer.css', () => ({}));

describe('ChatContainer', () => {
  const mockSendMessage = jest.fn();
  const user = userEvent.setup();

  const mockRAGResponse: RAGResponse = {
    response: 'Testowa odpowiedź asystenta',
    confidence: 0.85,
    sources: [
      {
        id: '1',
        title: 'Dokumentacja ERP',
        content: 'Zawartość dokumentu...',
        type: 'document',
        relevanceScore: 0.9,
      },
    ],
    processingTime: 150,
    searchResults: 5,
    model: 'claude-3-sonnet',
    tokenUsage: {
      prompt: 100,
      completion: 50,
      total: 150,
    },
  };

  beforeEach(() => {
    mockSendMessage.mockClear();
  });

  test('renders chat interface correctly', () => {
    render(<ChatContainer />);
    
    expect(screen.getByText('ERP AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Zadaj pytanie o ERP...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wyślij wiadomość/i })).toBeInTheDocument();
    expect(screen.getByText('Witaj w ERP AI Assistant!')).toBeInTheDocument();
  });

  test('displays welcome message when no messages', () => {
    render(<ChatContainer />);
    
    expect(screen.getByText('Witaj w ERP AI Assistant!')).toBeInTheDocument();
    expect(screen.getByText('Konfigurację systemu Comarch ERP XL')).toBeInTheDocument();
    expect(screen.getByText('Procedury wdrożeniowe')).toBeInTheDocument();
    expect(screen.getByText('Analizę danych biznesowych')).toBeInTheDocument();
    expect(screen.getByText('Generowanie raportów SQL')).toBeInTheDocument();
  });

  test('sends message on form submission', async () => {
    mockSendMessage.mockResolvedValueOnce(mockRAGResponse);
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    const sendButton = screen.getByRole('button', { name: /wyślij wiadomość/i });
    
    await user.type(input, 'Jak skonfigurować Comarch ERP XL?');
    await user.click(sendButton);
    
    expect(mockSendMessage).toHaveBeenCalledWith('Jak skonfigurować Comarch ERP XL?');
    
    await waitFor(() => {
      expect(screen.getByText('Jak skonfigurować Comarch ERP XL?')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Testowa odpowiedź asystenta')).toBeInTheDocument();
    });
  });

  test('sends message on Enter key press', async () => {
    mockSendMessage.mockResolvedValueOnce(mockRAGResponse);
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockSendMessage).toHaveBeenCalledWith('Test message');
  });

  test('does not send empty messages', async () => {
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    const sendButton = screen.getByRole('button', { name: /wyślij wiadomość/i });
    
    // Try to send empty message
    await user.click(sendButton);
    expect(mockSendMessage).not.toHaveBeenCalled();
    
    // Try to send whitespace only
    await user.type(input, '   ');
    await user.click(sendButton);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  test('disables input and button while loading', async () => {
    // Mock a delayed response
    mockSendMessage.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockRAGResponse), 100))
    );
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    const sendButton = screen.getByRole('button', { name: /wyślij wiadomość/i });
    
    await user.type(input, 'Test message');
    await user.click(sendButton);
    
    // Check that input and button are disabled during loading
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(screen.getByText('Przetwarzanie...')).toBeInTheDocument();
    
    // Wait for response
    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(sendButton).not.toBeDisabled();
      expect(screen.getByText('Gotowy')).toBeInTheDocument();
    });
  });

  test('displays typing indicator during message processing', async () => {
    mockSendMessage.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockRAGResponse), 100))
    );
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('Asystent pisze...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Asystent pisze...')).not.toBeInTheDocument();
    });
  });

  test('displays sources when available', async () => {
    mockSendMessage.mockResolvedValueOnce(mockRAGResponse);
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Źródła:')).toBeInTheDocument();
      expect(screen.getByText('Dokumentacja ERP')).toBeInTheDocument();
      expect(screen.getByText('(90.0%)')).toBeInTheDocument();
    });
  });

  test('displays confidence score when available', async () => {
    mockSendMessage.mockResolvedValueOnce(mockRAGResponse);
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Pewność: 85%')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const errorMessage = 'Network error';
    mockSendMessage.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText(`Błąd: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  test('applies custom className', () => {
    const { container } = render(<ChatContainer className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('chat-container');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('applies custom maxHeight', () => {
    const { container } = render(<ChatContainer maxHeight="800px" />);
    
    expect(container.firstChild).toHaveStyle('max-height: 800px');
  });

  test('displays message count in footer', async () => {
    mockSendMessage.mockResolvedValueOnce(mockRAGResponse);
    
    render(<ChatContainer onSendMessage={mockSendMessage} />);
    
    // Initial state
    expect(screen.getByText(/0 wiadomości/)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText(/2 wiadomości/)).toBeInTheDocument();
    });
  });

  test('respects maxLength on input field', () => {
    render(<ChatContainer />);
    
    const input = screen.getByPlaceholderText('Zadaj pytanie o ERP...');
    expect(input).toHaveAttribute('maxLength', '1000');
  });
});
