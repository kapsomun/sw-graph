import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/widgets/RootLayout";
import { lazy, Suspense } from "react";
import { PersonDetailsSkeleton } from "@/features/person-details/PersonDetailsSkeleton";

const PeoplePage = lazy(() => import("@/pages/PeoplePage"));
const PersonDetailsPage = lazy(() => import("@/pages/PersonDetailsPage"));

// Define application routes using React Router v6+ data API
export const router = createBrowserRouter([
  {
    // Root layout shared across all pages (header, background, etc.)
    element: <RootLayout />,
    children: [
      // Main list of Star Wars characters
      {
        path: "/",
        element: (
          <Suspense fallback={<div className="sw-skeleton h-40 rounded-md" />}>
            <PeoplePage />
          </Suspense>
        ),
      },

      // Detailed page for a single character with graph visualization
      {
        path: "/people/:id",
        element: (
          <Suspense fallback={<PersonDetailsSkeleton />}>
            <PersonDetailsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
