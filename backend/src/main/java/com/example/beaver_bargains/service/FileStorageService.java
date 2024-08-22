package com.example.beaver_bargains.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        Path targetLocation = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFileName;
    }

    @Cacheable(value = "filePaths", key = "#fileName")
    public Path getFilePath(String fileName) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
    }

    @CacheEvict(value = "filePaths", key = "#fileName")
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = getFilePath(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting file: " + fileName, ex);
        }
    }
}