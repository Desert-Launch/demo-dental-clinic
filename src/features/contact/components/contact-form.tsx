"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  contactFormSchema,
  contactTopics,
  useSubmitEnquiry,
  type ContactFormValues,
  type ContactReceipt,
} from "@/features/contact";

const emptyEnquiry: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  topic: "New patient enquiry",
  message: "",
};

export function ContactForm() {
  const [receipt, setReceipt] = useState<ContactReceipt | null>(null);
  const { mutate, isPending } = useSubmitEnquiry();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: emptyEnquiry,
    mode: "onBlur",
  });

  function onSubmit(values: ContactFormValues) {
    mutate(values, {
      onSuccess: (result) => {
        setReceipt(result);
        form.reset(emptyEnquiry);
        toast.success("Message sent", {
          description: `Reference ${result.reference}. We reply within ${result.repliesWithin}.`,
        });
      },
      onError: () => {
        toast.error("Message not sent", {
          description: "Nothing left your browser. Try again, or call the clinic.",
        });
      },
    });
  }

  if (receipt) {
    return (
      <div className="rounded-xl border border-mint-300 bg-mint-50 p-8">
        <span className="flex size-11 items-center justify-center rounded-full bg-mint-200 text-brand-800">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
        <h2 className="mt-5 text-title">Message sent</h2>
        <p className="mt-3 text-body text-ink-700">
          Your reference is{" "}
          <span data-numeric className="font-semibold text-brand-800">
            {receipt.reference}
          </span>
          . Someone from the front desk replies within {receipt.repliesWithin}. If it is
          urgent, calling is faster.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setReceipt(null)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-xl border border-border bg-surface p-7 sm:p-8"
        noValidate
      >
        <h2 className="text-title">Send us a message</h2>
        <p className="mt-2 text-body text-ink-600">
          We answer every message ourselves — no call centre.
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+971 50 123 4567"
                    inputMode="tel"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>What is it about?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contactTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Tell us what is bothering you, or what you would like to change."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto" disabled={isPending}>
          <Send aria-hidden />
          {isPending ? "Sending…" : "Send message"}
        </Button>
        <p className="mt-4 text-small text-ink-500">
          Nothing is actually sent — this is a demo clinic with no mailbox behind it.
        </p>
      </form>
    </Form>
  );
}
