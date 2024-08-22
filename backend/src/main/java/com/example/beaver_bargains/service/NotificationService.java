package com.example.beaver_bargains.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import com.example.beaver_bargains.entity.Message;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.MessageRepository;
import com.example.beaver_bargains.repository.UserRepository;
import com.example.beaver_bargains.service.CustomExceptions.ResourceNotFoundException;

@Service
public class NotificationService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Cacheable(value = "unreadMessageCount", key = "#userId")
    public long getUnreadMessageCount(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.countByReceiverAndIsReadFalse(user);
    }

    @Cacheable(value = "unreadMessages", key = "#userId")
    public List<Message> getUnreadMessages(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.findByReceiverAndIsReadFalse(user);
    }

    @Caching(evict = {
            @CacheEvict(value = "unreadMessageCount", key = "#result.receiver.id"),
            @CacheEvict(value = "unreadMessages", key = "#result.receiver.id")
    })
    public Message markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        message.setIsRead(true);
        return messageRepository.save(message);
    }

    @Caching(evict = {
            @CacheEvict(value = "unreadMessageCount", key = "#result.id"),
            @CacheEvict(value = "unreadMessages", key = "#result.id")
    })
    public User markConversationAsRead(Long conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Message> unreadMessages = messageRepository.findByConversationIdAndReceiverAndIsReadFalse(conversationId,
                user);
        unreadMessages.forEach(message -> message.setIsRead(true));
        messageRepository.saveAll(unreadMessages);
        return user;
    }
}