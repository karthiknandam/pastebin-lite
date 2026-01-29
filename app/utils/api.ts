import { FormValues } from "@/components/Form";

export type postPasteResponse = {
  id?: string;
  url?: string;
};

export const postPaste = async (formValues: FormValues) => {
  const body = {
    content: formValues.content,

    ...(typeof formValues.ttl === "number" &&
      formValues.ttl > 0 && {
        ttl_seconds: formValues.ttl,
      }),

    ...(typeof formValues.views === "number" &&
      formValues.views > 0 && {
        max_views: formValues.views,
      }),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pastes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data;
};
