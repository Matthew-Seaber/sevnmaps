"use client";

import { useState } from "react";

import emailjs from "@emailjs/browser";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !category || !message) {
      toast.info("Please fill in all form fields before submitting.");

      return;
    }

    if (message.length > 2000) {
      toast.info(`Message exceeds max length (${message.length}/2000).`);
      return;
    }

    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_CONTACT_US_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
      toast.error(
        "Server error. Please try again later or contact us via email for urgent requests.",
      );
      return;
    }

    toast.promise(
      emailjs
        .send(
          serviceID,
          templateID,
          {
            name,
            email,
            subject,
            category,
            message,
          },
          { publicKey: publicKey },
        )
        .then(() => {
          setName("");
          setEmail("");
          setSubject("");
          setCategory("");
          setMessage("");
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        }),
      {
        loading: "Sending message...",
        success: "Message sent!",
        error: "Failed to send message. Please try again later.",
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">
        Contact Us
      </h1>
      <p className="mb-8">
        Get in touch with the SevnMaps team with any questions or feedback you
        may have!
      </p>

      <form
        className="mb-6 border border-border flex flex-col gap-4 rounded-xl p-4"
        onSubmit={sendEmail}
      >
        <h3>Your details</h3>
        <div className="flex flex-row gap-2 sm:w-lg flex-wrap sm:flex-nowrap">
          <Input
            type="text"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-5 w-full sm:w-1/3"
          />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-5 w-full sm:w-2/3"
          />
        </div>

        <h3>Your message</h3>
        <div className="flex flex-row gap-2 sm:w-lg flex-wrap sm:flex-nowrap">
          <Input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-5"
          />
          <Select
            value={category || ""}
            onValueChange={(value) => setCategory(value || "")}
          >
            <SelectTrigger className="w-full px-3 py-5">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select category</SelectLabel>

                <SelectItem value="Account help">Account help</SelectItem>
                <SelectItem value="Subscription query">
                  Subscription query
                </SelectItem>
                <SelectItem value="Billing question">
                  Billing question
                </SelectItem>
                <SelectItem value="Technical support">
                  Technical support
                </SelectItem>
                <SelectItem value="General feedback">
                  General feedback
                </SelectItem>
                <SelectItem value="Feature request">Feature request</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <textarea
          placeholder="Your message"
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="px-3 py-3 border border-input rounded-md resize-vertical min-h-48"
        />

        <div className="w-full flex justify-center">
          <Button type="submit" size="lg" className="h-10 px-6">
            Send message
          </Button>
        </div>
      </form>
      <Toaster position="top-center" />
    </div>
  );
}

export default ContactPage;
