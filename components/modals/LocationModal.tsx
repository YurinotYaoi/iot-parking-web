"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onClose: () => void;
  onSave: (name: string, link: string) => void;
  initialName?: string;
  initialLink?: string;
};

export default function LocationModal({ onClose, onSave, initialName = "", initialLink = "" }: Props) {
  const [name, setName] = useState(initialName);
  const [link, setLink] = useState(initialLink);

  const extractEmbedSrc = (input: string) => {
    if (input.startsWith('<iframe')) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input;
    }
    return input;
  };

  const handleLinkChange = (value: string) => {
    setLink(extractEmbedSrc(value));
  };

  const handleSave = () => {
    onSave(name, link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close location modal"
      />

      <div className="fp-panel relative bg-card text-card-foreground p-6 w-full max-w-[500px]">
        <h2 className="text-xl font-bold tracking-tight mb-5">Set Location</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="location-name" className="block text-sm font-medium mb-1.5 text-foreground">
              Location Name
            </label>
            <input
              id="location-name"
              className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Parking Lot"
            />
          </div>

          <div>
            <label htmlFor="location-link" className="block text-sm font-medium mb-1.5 text-foreground">
              Google Maps Embed (Paste iframe HTML or link)
            </label>
            <input
              id="location-link"
              className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              value={link}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="Paste iframe HTML or embed link"
            />
          </div>

          {link && (
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Preview
              </label>
              <iframe
                src={link}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg border border-border"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={handleSave}>
            Save Location
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}