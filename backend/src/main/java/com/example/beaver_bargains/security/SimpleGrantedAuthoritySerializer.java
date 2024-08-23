package com.example.beaver_bargains.security;

import java.io.IOException;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

public class SimpleGrantedAuthoritySerializer extends JsonSerializer<SimpleGrantedAuthority> {
    @Override
    public void serialize(SimpleGrantedAuthority value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();
        gen.writeStringField("authority", value.getAuthority());
        gen.writeEndObject();
    }
}