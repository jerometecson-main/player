"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

interface TrackEmbedderRequest {
  embed: string;
  embedder: string;
  sandbox: boolean;
}

export function useTrackEmbedder() {
  return useMutation({
    mutationFn: async (body: TrackEmbedderRequest) => {
      const res = await axios.post("/backend/cdn-cgi", body);

      return res.data;
    },
  });
}
