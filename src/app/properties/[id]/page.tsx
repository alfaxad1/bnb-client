"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import api from "@/lib/axios";
import { formatCurrency, getReadableError } from "@/lib/utils";
import type { Property } from "@/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80";

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<Property>(`/properties/${params.id}`);
        setProperty(response.data);
      } catch (err) {
        setError(getReadableError(err, "Could not load property details."));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [params.id]);

  const galleryImages = useMemo(() => {
    if (!property) return [fallbackImage];

    const images = [property.mainImage, ...(property.images ?? [])].filter(
      Boolean,
    ) as string[];
    const unique = Array.from(new Set(images));

    return unique.length > 0 ? unique : [fallbackImage];
  }, [property]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [galleryImages]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="bg-primary py-16">
          <div className="container-shell">
            <LoadingSpinner label="Loading property details..." />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />
        <main className="bg-primary py-16">
          <div className="container-shell space-y-4">
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error ?? "Property not found."}
            </p>
            <Link href="/properties" className="btn-ghost inline-flex">
              Back to Properties
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-primary py-12">
        <section className="container-shell space-y-6">
          <Link href="/properties" className="btn-ghost inline-flex">
            Back to Properties
          </Link>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <article className="space-y-4 rounded-2xl border border-secondary/10 bg-white p-5 shadow-soft">
              <header>
                <h1 className="text-3xl font-semibold">{property.name}</h1>
                <p className="mt-1 text-sm text-dark/70">
                  {property.location.address}, {property.location.city},{" "}
                  {property.location.country}
                </p>
              </header>

              <div className="overflow-hidden rounded-xl border border-secondary/10">
                <div className="relative h-72 w-full sm:h-96">
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt={property.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 66vw, 100vw"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {galleryImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`overflow-hidden rounded-lg border ${
                      index === selectedImageIndex
                        ? "border-secondary"
                        : "border-secondary/15"
                    }`}
                  >
                    <div className="relative h-20 w-full">
                      <Image
                        src={image}
                        alt={`${property.name} image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="20vw"
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3 rounded-xl bg-muted p-4 text-sm text-dark/80">
                <p>{property.description}</p>
                <p>
                  <span className="font-semibold text-secondary">Price:</span>{" "}
                  {formatCurrency(property.pricePerNight)} per night
                </p>
                <p>
                  <span className="font-semibold text-secondary">
                    Max Guests:
                  </span>{" "}
                  {property.maxGuests}
                </p>
                {/* <p>
                  <span className="font-semibold text-secondary">Hosted by:</span> {property.owner?.name ?? 'Verified Owner'}
                </p> */}
              </div>

              {property.rules?.length ? (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">House Rules</h2>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-dark/80">
                    {property.rules.map((rule, index) => (
                      <li key={`${rule}-${index}`}>{rule}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>

            <aside className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-semibold">Payment Details</h2>
              <p className="mt-1 text-sm text-dark/70">
                To complete your booking, please make a payment using one of the
                options below.
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-muted p-4 space-y-4">
                  <h3 className="font-semibold text-secondary border-b border-secondary/10 pb-2">
                    Option 1: Paybill
                  </h3>
                  <div className="flex items-center justify-between border-b border-secondary/10 pb-2">
                    <span className="font-medium text-dark/70">
                      Paybill Number:
                    </span>
                    <span className="font-bold text-secondary text-lg">
                      247247
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-secondary/10 pb-2">
                    <span className="font-medium text-dark/70">
                      Account Number:
                    </span>
                    <span className="font-bold text-secondary text-lg">
                      128 499 0052
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-dark/70">
                      Account Name:
                    </span>
                    <span className="font-bold text-secondary text-lg">
                      ADTECH AGENCIES
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted p-4 space-y-4">
                  <h3 className="font-semibold text-secondary border-b border-secondary/10 pb-2">
                    Option 2: Buy Goods
                  </h3>
                  <div className="flex items-center justify-between border-b border-secondary/10 pb-2">
                    <span className="font-medium text-dark/70">
                      Till Number:
                    </span>
                    <span className="font-bold text-secondary text-lg">
                      3493078
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-dark/70">Till Name:</span>
                    <span className="font-bold text-secondary text-lg">
                      ADTECH AGENCIES
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-dark/60">
                Contact us on{" "}
                <span className="font-bold text-secondary">
                  +254 759 155 914 or +254 113 863 614
                </span>
              </p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
