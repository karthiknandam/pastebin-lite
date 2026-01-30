"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import * as z from "zod";
import { postPaste } from "@/app/utils/api";
import { toast } from "sonner";
import { useUrlStore } from "@/app/utils/store";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

const ttlTime = [
  { label: "Never", value: 0 },
  { label: "10 minutes", value: 600 },
  { label: "1 Hour", value: 3600 },
  { label: "1 Day", value: 86_400 },
  { label: "1 Week", value: 6_04_800 },
  { label: "1 Month", value: 25_92_000 },
  { label: "1 Year", value: 3_15_36_000 },
] as const;

const formSchema = z.object({
  content: z.string().trim().min(1, "Text should not be empty").max(10000),

  ttl: z.number().optional(),

  views: z.number().min(1, "View must be >=1").optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export function Form() {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      ttl: 0,
      views: undefined,
    },
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  const { setUrl } = useUrlStore();
  const content = watch("content");

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);
      const res = await postPaste(data);
      if (!res.success) {
        toast.error(`Error : ${res.error}`);
        return;
      }

      if (!res) {
        toast.error("Unknown Error occur please try again later");
        return;
      }
      toast.success("Created");
      setUrl({ url: res?.url, id: res?.id });
      reset();
    } catch (error) {
      toast.error("Unknown Error occured");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-border">
      <CardContent>
        <form id="pastebin-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* paste box */}
            <Field data-invalid={!!errors.content}>
              <FieldLabel>Paste Text</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...register("content")}
                  rows={6}
                  className="min-h-24 resize-none text-xs md:text-sm"
                  placeholder="Enter your text here....."
                  aria-invalid={!!errors.content}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {content?.length ?? 0}/10000
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.content && (
                <FieldError errors={[{ message: errors.content.message }]} />
              )}
            </Field>

            {/* ttl */}
            <Controller
              name="ttl"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.ttl}>
                  <FieldContent>
                    <FieldLabel>Time to Live</FieldLabel>
                    {errors.ttl && (
                      <FieldError errors={[{ message: errors.ttl.message! }]} />
                    )}
                  </FieldContent>

                  <Select
                    value={String(field.value)}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      <SelectItem value={`0`}>Never</SelectItem>
                      <SelectSeparator />
                      {ttlTime.slice(1).map((t, i) => (
                        <SelectItem key={t.label} value={String(t.value)}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* Views */}
            <Controller
              name="views"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.views}>
                  <FieldLabel>Max Views</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                    className="text-xs md:text-sm"
                    placeholder="By default number is not selected"
                    aria-invalid={!!errors.views}
                  />
                  {errors.views && (
                    <FieldError errors={[{ message: errors.views.message! }]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => reset()}
            disabled={submitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            form="pastebin-form"
            disabled={submitting}
          >
            {submitting ? <Spinner /> : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
