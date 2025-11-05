"use client";
import { useDatabase } from "@/contexts/databaseContext";
import { categories } from "@/lib/types/category";
import { useSession } from "@clerk/nextjs";
import React, { useState } from "react";
import { Button } from "../button/button";

interface GoLiveFormProps {
  onGolive: () => void;
  onCancel: () => void;
}

const AVAILABLE_CATEGORIES = categories.map((category) => category.name);

const GoLiveForm = ({ onGolive, onCancel }: GoLiveFormProps) => {
  const [streamName, setStreamName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useSession();
  const { createLivestream, getUserData } = useDatabase();

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!streamName.trim()) {
      alert("Please enter a stream name");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Please select at least one category");
      return;
    }
    setIsSubmitting(true);
    try {
      const userId = session?.user.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const userData = await getUserData(userId);
      if (!userData) {
        throw new Error("User data not found");
      }

      const livestream = await createLivestream(
        streamName.trim(),
        selectedCategories,
        userData.user_name,
        userData.image_url || "https://randomuser.me/api/portraits/men/1.jpg"
      );
      if (livestream) {
        onGolive();
      } else {
        alert("Failed to create a livestream");
      }
    } catch (error) {
      console.log("error  creating livestream", error);
      alert("Failed to create livestream");
    } finally {
      setIsSubmitting(false);
    }
  };

  function isFormValid() {
    return streamName.trim() && selectedCategories.length > 0 && !isSubmitting;
  }
  return (
    <div className="fixed inset-0 bh-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-gray-500 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Go Live</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="streamName"
              className="block text-sm font-medium mb-2"
            >
              Stream Name
            </label>
            <input
              type="text"
              id="streamName"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus: ring-2 focus: ring-purple-500"
              placeholder="Enter your stream name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Categories (select at least one)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => handleCategoryToggle(category)}
                      className="rounded text-golivehub-purple focus: ring-golivehub-purple"
                    />
                    <span className="text-sm capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid()}
              className={`flex-1 ${
                !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Go Live"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoLiveForm;
