package com.example.beaver_bargains.service.implementation;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;

import com.example.beaver_bargains.dto.ProductDTO;
import com.example.beaver_bargains.entity.Product;
import com.example.beaver_bargains.repository.ProductRepository;

class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    
    @Test
    void testCreateProduct() {

        ProductDTO inputDto = new ProductDTO();
        inputDto.setName("Test Product Name");
        inputDto.setPrice(new BigDecimal(99.99));

        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product Name");
        product.setPrice(new BigDecimal(99.99));

        ProductDTO outputDto = new ProductDTO();
        outputDto.setId(1L);
        outputDto.setName("Test Product Name");
        outputDto.setPrice(new BigDecimal(99.99));

        when(modelMapper.map(inputDto, Product.class)).thenReturn(product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(modelMapper.map(product, ProductDTO.class)).thenReturn(outputDto);

        ProductDTO result = productService.createProduct(inputDto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Product Name", result.getName());
        assertEquals(new BigDecimal(99.99), result.getPrice());

        verify(productRepository, times(1)).save(any(Product.class));
        verify(modelMapper, times(1)).map(inputDto, Product.class);        
        verify(modelMapper, times(1)).map(product, ProductDTO.class);        
    }

    @Test
    void testGetProductById_Success() {

        Long productId = 1L;
        Product product = new Product();
        product.setId(productId);
        product.setName("Test Product Name");
        product.setPrice(new BigDecimal(99.99));

        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(productId);
        productDTO.setName("Test Product Name");
        productDTO.setPrice(new BigDecimal(99.99));

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(modelMapper.map(product, ProductDTO.class)).thenReturn(productDTO);

        ProductDTO result = productService.getProductById(productId);

        assertNotNull(result);
        assertEquals(productId, result.getId());
        assertEquals("Test Product Name", result.getName());
        assertEquals(new BigDecimal(99.99), result.getPrice());

        verify(productRepository, times(1)).findById(productId);
        verify(modelMapper, times(1)).map(product, ProductDTO.class);
    }

    @Test
    void testGetProductById_Fail() {

        Long id = 99L;
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            productService.getProductById(id);
        });

        String expectedString = "Product not found with id: " + id;
        String actualString = exception.getMessage();

        assertTrue(actualString.contains(expectedString));
        verify(productRepository, times(1)).findById(id);
        verify(modelMapper, never()).map(any(), any());
    }

}