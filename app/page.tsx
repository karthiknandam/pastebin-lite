"use client";
import { Form } from "@/components/Form";
import Image from "next/image";
import { useUrlStore } from "./utils/store";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { urls } = useUrlStore();
  return (
    <main className="w-screen h-full flex justify-center md:mt-10 p-5">
      <div className="border-dotted border-border border-[1px] rounded-md bg-muted/50 text-gray-300 w-3xl my-10 p-4 md:p-8">
        <div className="mb-4 text-center flex flex-col gap-2">
          <h1 className="font-bold text-2xl">Pastebin</h1>
          <p className="text-sm text-accent-foreground/50">
            paste any text to share with your secret ones with simple url
          </p>
        </div>
        <Form />
        <h2 className="mt-4">Your short urls :</h2>
        {urls.length > 0 && (
          <Card className="mt-4 p-3 border-border">
            {urls.map((url, i) => (
              <Card key={i} className="border-border p-2">
                <div
                  className="flex gap-1 cursor-pointer hover:text-muted-foreground/80"
                  onClick={async () => {
                    toast.success("Copied to clipboard");
                    await navigator.clipboard.writeText(url?.url || "");
                  }}
                >
                  <p className="text-sm">{url.url}</p>
                  <Copy className="size-3 text-muted-foreground/80" />
                </div>
              </Card>
            ))}
          </Card>
        )}
      </div>
    </main>
  );
}
