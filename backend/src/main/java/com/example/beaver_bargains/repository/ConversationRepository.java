package com.example.beaver_bargains.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.beaver_bargains.entity.Conversation;
import com.example.beaver_bargains.entity.User;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUser1OrUser2(User user1, User user2);

    Optional<Conversation> findByUser1AndUser2OrUser1AndUser2(User user1, User user2, User user2Again, User user1Again);
}