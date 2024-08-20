package com.example.beaver_bargains.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.beaver_bargains.dto.UserDto;
import com.example.beaver_bargains.entity.Conversation;
import com.example.beaver_bargains.entity.Message;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.ConversationRepository;
import com.example.beaver_bargains.repository.MessageRepository;
import com.example.beaver_bargains.service.CustomExceptions.ResourceNotFoundException;

@Service
public class MessageService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserService userService;

    public Conversation getOrCreateConversation(String senderEmail, Long receiverId) {
        User sender = userService.getUserByEmail(senderEmail);
        UserDto receiverDto = userService.getUserDetails(receiverId);
        User receiver = receiverDto.toUser();

        Optional<Conversation> existingConversation = conversationRepository.findByUser1AndUser2OrUser1AndUser2(sender, receiver, receiver, sender);

        return existingConversation.orElseGet(() -> {
            Conversation newConversation = new Conversation();
            newConversation.setUser1(sender);
            newConversation.setUser2(receiver);
            newConversation.setLastMessageTimestamp(Instant.now());
            return conversationRepository.save(newConversation);
        });
    }

    public List<Conversation> getUserConversations(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return conversationRepository.findByUser1OrUser2(user, user);
    }

    public List<UserDto> getConversationUsers(String userEmail) {
        User currentUser = userService.getUserByEmail(userEmail);
        List<Conversation> conversations = conversationRepository.findByUser1OrUser2(currentUser, currentUser);

        return conversations.stream()
            .map(conversation -> conversation.getUser1().equals(currentUser) ? conversation.getUser2(): conversation.getUser1())
            .distinct()
            .map(user -> new UserDto(user))
            .collect(Collectors.toList());
    }

    public Message sendMessage(String senderEmail, Long conversationId, String content) {
        User sender = userService.getUserByEmail(senderEmail);
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        User receiver = (conversation.getUser1().getId().equals(sender.getId())) ? conversation.getUser2() : conversation.getUser1();

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setConversation(conversation);
        message.setContent(content);
        message.setTimestamp(Instant.now());

        return messageRepository.save(message);
    }

    public List<Message> getConversationMessages(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        return messageRepository.findByConversationOrderByTimestampAsc(conversation);
    }
}