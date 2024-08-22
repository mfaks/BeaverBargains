package com.example.beaver_bargains.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.beaver_bargains.dto.ConversationDto;
import com.example.beaver_bargains.dto.MessageDto;
import com.example.beaver_bargains.dto.UserDto;
import com.example.beaver_bargains.entity.Conversation;
import com.example.beaver_bargains.entity.Message;
import com.example.beaver_bargains.service.MessageService;
import com.example.beaver_bargains.service.NotificationService;
import com.example.beaver_bargains.service.UserService;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Conversation> getOrCreateConversation(@RequestBody ConversationDto conversationDto,
            Authentication authentication) {
        String senderEmail = authentication.getName();
        Conversation conversation = messageService.getOrCreateConversation(senderEmail,
                conversationDto.getReceiverId());
        return ResponseEntity.ok(conversation);
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getUserConversations(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Conversation> conversations = messageService.getUserConversations(userEmail);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversation-users")
    public ResponseEntity<List<UserDto>> getConversationUsers(Authentication authentication) {
        String userEmail = authentication.getName();
        List<UserDto> conversationUsers = messageService.getConversationUsers(userEmail);
        return ResponseEntity.ok(conversationUsers);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Message> sendMessage(@PathVariable Long conversationId, @RequestBody MessageDto messageDto,
            Authentication authentication) {
        String senderEmail = authentication.getName();
        Message message = messageService.sendMessage(senderEmail, conversationId, messageDto.getContent());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable Long conversationId) {
        List<Message> messages = messageService.getConversationMessages(conversationId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount(Authentication authentication) {
        Long userId = userService.getUserId(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadMessageCount(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnreadMessages(Authentication authentication) {
        Long userId = userService.getUserId(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadMessages(userId));
    }

    @PostMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        notificationService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(@PathVariable Long conversationId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        notificationService.markConversationAsRead(conversationId, userEmail);
        return ResponseEntity.ok().build();
    }
}