"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketplaceItemCardProps } from "@/types/MarketplaceItemCardProps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  User,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DateIcon from "../../components/ui/DateIcon";

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  item,
  onToggleFavorite,
  getFullImageUrl,
}) => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(item.isFavorited);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isFullDetailsOpen, setIsFullDetailsOpen] = useState(false);
  const [messageContent, setMessageContent] = useState(
    `Hi ${item.seller.firstName}, my name is ${user?.firstName} and I'm interested in your item: ${item.title}`,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullImageUrls, setFullImageUrls] = useState<string[]>([]);
  const [sellerProfileImageUrl, setSellerProfileImageUrl] = useState("");

  useEffect(() => {
    setIsFavorited(item.isFavorited);
  }, [item.isFavorited]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setSellerProfileImageUrl(
      getFullProfileImageUrl(item.seller.profileImageUrl),
    );
    setFullImageUrls(getFullImageUrl(item.imageUrls || []));
  }, [item.imageUrls, item.seller.profileImageUrl, getFullImageUrl]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onToggleFavorite(item.id);
  };

  const handleMessageClick = async () => {
    try {
      const conversationsResponse = await axios.get(
        "https://beaverbargains.onrender.com/api/messages",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      let conversationId;
      const existingConversation = conversationsResponse.data.find(
        (conv: { user1: { id: number }; user2: { id: number } }) =>
          conv.user1.id === item.seller.id || conv.user2.id === item.seller.id,
      );
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        const newConversationResponse = await axios.post(
          "https://beaverbargains.onrender.com/api/messages",
          { receiverId: item.seller.id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        conversationId = newConversationResponse.data.id;
      }

      await axios.post(
        `https://beaverbargains.onrender.com/api/messages/conversations/${conversationId}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsMessageDialogOpen(false);
      router.push(
        `/messages?conversation=${conversationId}&otherUserId=${item.seller.id}`,
      );
    } catch (error) {
      console.error("Error handling message click:", error);
      alert(
        "An error occurred while trying to send the message. Please try again.",
      );
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fullImageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + fullImageUrls.length) % fullImageUrls.length,
    );
  };

  const BASE_URL = "https://beaverbargains.onrender.com";
  const getFullProfileImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return "";
    }
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    return `${BASE_URL}/uploads/${imageUrl}`;
  };

  return (
    <div>
      <Card
        className="w-full h-[420px] rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 border-orange-300 flex flex-col"
        onClick={() => setIsFullDetailsOpen(true)}
      >
        <div className="relative h-56 flex-shrink-0">
          <img
            src={fullImageUrls[0] || "/placeholder-image.jpg"}
            alt={`${item.title} - Main Image`}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-2 right-2 p-1 rounded-full ${isFavorited ? "bg-orange-500" : "bg-white/70"}`}
          >
            <Image
              src="/icons/heart-icon.svg"
              alt="Favorite"
              width={16}
              height={16}
              className={isFavorited ? "filter invert" : ""}
            />
          </button>
        </div>
        <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {item.title}
              </h3>
              <span className="text-xl font-bold text-orange-600">
                ${item.price.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          </div>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-1 mt-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsMessageDialogOpen(true);
            }}
          >
            {`Message ${item.seller.firstName}`}
          </Button>
        </div>
      </Card>
      <Dialog open={isFullDetailsOpen} onOpenChange={setIsFullDetailsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 relative">
              <img
                src={
                  fullImageUrls[currentImageIndex] || "/placeholder-image.jpg"
                }
                alt={`${item.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {fullImageUrls.length > 1 && (
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white rounded-full p-2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white rounded-full p-2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 p-6 bg-gray-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {item.title}
                </DialogTitle>
              </DialogHeader>
              <p className="text-3xl font-bold text-orange-600 mb-4">
                ${item.price.toFixed(2)}
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Description: {item.description}
              </p>
              <div className="flex flex-col space-y-4 text-base text-gray-500 mb-6">
                <div className="flex items-center">
                  <div className="w-16 flex justify-center items-center">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarImage
                        src={
                          sellerProfileImageUrl || "/default-profile-image.jpg"
                        }
                        alt={`${item.seller.firstName} ${item.seller.lastName}`}
                      />
                      <AvatarFallback className="bg-orange-500 text-white text-xl">
                        {item.seller.firstName.charAt(0).toUpperCase()}
                        {item.seller.lastName
                          ? item.seller.lastName.charAt(0).toUpperCase()
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-lg ml-3">
                    Seller: {item.seller.firstName} {item.seller.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-16 flex justify-center items-center">
                    <DateIcon date={new Date(item.listingDate)} />
                  </div>
                  <span className="text-lg ml-3">
                    Listed on:{" "}
                    {new Date(item.listingDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3"
                  onClick={() => {
                    setIsFullDetailsOpen(false);
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageCircle className="h-6 w-6 mr-3" />
                  <span className="text-lg">
                    Message {item.seller.firstName}
                  </span>
                </Button>
                <Button
                  className={`flex-1 ${isFavorited ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-600"} hover:bg-orange-200 py-3`}
                  onClick={handleFavoriteToggle}
                >
                  <Heart
                    className={`h-6 w-6 mr-3 ${isFavorited ? "fill-current" : ""}`}
                  />
                  <span className="text-lg">
                    {isFavorited ? "Favorited" : "Add to Favorites"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send a Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px] mt-4"
          />
          <DialogFooter>
            <Button
              onClick={handleMessageClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Send
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceItemCard;
