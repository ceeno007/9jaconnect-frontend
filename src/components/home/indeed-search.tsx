"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { listCategories, listLgas, listStates } from "@/lib/api";
import type { Category, Lga, State } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const morphTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.85,
};

export function IndeedStyleSearch({
  className,
  showCategory = true,
  initialKeyword = "",
  initialState = "",
  initialLga = "",
  initialCategory = "",
}: {
  className?: string;
  showCategory?: boolean;
  initialKeyword?: string;
  initialState?: string;
  initialLga?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [stateId, setStateId] = useState(initialState);
  const [lgaId, setLgaId] = useState(initialLga);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setKeyword(initialKeyword);
    setStateId(initialState);
    setLgaId(initialLga);
    setCategoryId(initialCategory);
  }, [initialKeyword, initialState, initialLga, initialCategory]);

  useEffect(() => {
    void Promise.all([listStates(), listCategories()]).then(
      ([nextStates, nextCategories]) => {
        setStates(nextStates);
        setCategories(nextCategories);
      },
    );
  }, []);

  useEffect(() => {
    if (!stateId) {
      setLgas([]);
      setLgaId("");
      return;
    }
    let cancelled = false;
    void listLgas(stateId).then((next) => {
      if (cancelled) return;
      setLgas(next);
      setLgaId((current) =>
        current && next.some((item) => item.id === current) ? current : "",
      );
    });
    return () => {
      cancelled = true;
    };
  }, [stateId]);

  function onStateChange(value: string) {
    setStateId(value);
    setLgaId("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (stateId) params.set("state", stateId);
    if (stateId && lgaId) params.set("lga", lgaId);
    if (categoryId) params.set("category", categoryId);
    router.push(`/find?${params.toString()}`);
  }

  const selectedStateName =
    states.find((item) => item.id === stateId)?.name ?? "";

  return (
    <motion.form
      layout
      transition={morphTransition}
      onSubmit={onSubmit}
      className={cn(
        "grid w-full overflow-hidden rounded-[12px] border border-[#6f6f6f] bg-white",
        "grid-cols-2 sm:flex sm:flex-row sm:items-stretch",
        className,
      )}
    >
      <label className="col-span-2 flex h-12 items-center border-b border-[#e4e2e0] px-3 sm:h-auto sm:min-h-[56px] sm:flex-1 sm:border-b-0 sm:px-4">
        <div className="min-w-0 flex-1">
          <span className="hidden text-xs font-bold text-[#595959] sm:block">
            What
          </span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Job title, skill, or keyword"
            className="w-full bg-transparent text-[15px] font-semibold text-black outline-none placeholder:font-medium placeholder:text-[#767676] sm:text-[16px]"
            aria-label="Keyword"
          />
        </div>
      </label>

      <span className="hidden w-px self-stretch bg-[#e4e2e0] sm:block" />

      <label className="flex h-12 items-center border-b border-r border-[#e4e2e0] px-3 sm:h-auto sm:min-h-[56px] sm:flex-1 sm:border-b-0 sm:border-r-0 sm:px-4">
        <div className="min-w-0 flex-1">
          <span className="hidden text-xs font-bold text-[#595959] sm:block">
            State
          </span>
          <select
            value={stateId}
            onChange={(event) => onStateChange(event.target.value)}
            className="w-full bg-transparent text-[15px] font-semibold text-black outline-none sm:text-[16px]"
            aria-label="State"
          >
            <option value="">All Nigeria</option>
            {states.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </label>

      <span className="hidden w-px self-stretch bg-[#e4e2e0] sm:block" />

      <label
        className={cn(
          "flex h-12 items-center gap-2 border-b border-[#e4e2e0] px-3 sm:h-auto sm:min-h-[56px] sm:flex-1 sm:gap-3 sm:border-b-0 sm:px-4",
          !stateId && "opacity-50",
        )}
      >
        <div className="min-w-0 flex-1">
          <span className="hidden text-xs font-bold text-[#595959] sm:block">
            LGA
          </span>
          <select
            value={lgaId}
            onChange={(event) => setLgaId(event.target.value)}
            disabled={!stateId}
            className="w-full bg-transparent text-[15px] font-semibold text-black outline-none disabled:cursor-not-allowed sm:text-[16px]"
            aria-label="LGA"
          >
            <option value="">
              {selectedStateName
                ? `Whole ${selectedStateName}`
                : "Select LGA"}
            </option>
            {lgas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </label>

      {showCategory ? (
        <>
          <span className="hidden w-px self-stretch bg-[#e4e2e0] sm:block" />
          <label className="col-span-2 flex h-12 items-center gap-2 border-b border-[#e4e2e0] px-3 sm:col-auto sm:h-auto sm:min-h-[56px] sm:flex-1 sm:gap-3 sm:border-b-0 sm:px-4">
            <div className="min-w-0 flex-1">
              <span className="hidden text-xs font-bold text-[#595959] sm:block">
                Category
              </span>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full bg-transparent text-[15px] font-semibold text-black outline-none sm:text-[16px]"
                aria-label="Category"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </>
      ) : null}

      <div className="col-span-2 p-2 sm:col-auto sm:border-t-0 sm:p-1.5">
        <Button
          type="submit"
          className="h-11 w-full rounded-[8px] px-6 text-[15px] sm:h-12 sm:w-auto sm:text-[16px]"
        >
          Find pros
        </Button>
      </div>
    </motion.form>
  );
}
