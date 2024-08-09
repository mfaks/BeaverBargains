package com.example.beaver_bargains.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.beaver_bargains.entity.Conversation;
import com.example.beaver_bargains.entity.Message;
import com.example.beaver_bargains.entity.User;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationOrderByTimestampAsc(Conversation conversation);
    List<Message> findByReceiverAndIsReadFalse(User receiver);
    long countByReceiverAndIsReadFalse(User receiver);
    List<Message> findByConversationIdAndReceiverAndIsReadFalse(Long conversationId, User receiver);
}