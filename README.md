# Edge Inspector

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cagdascf/edge-inspector)

An interactive, real-time troubleshooting dashboard to diagnose website performance and security issues directly from the Cloudflare Edge.

## About The Project

Edge Inspector is a comprehensive, interactive troubleshooting dashboard designed to diagnose website performance, security, and configuration issues directly from the Cloudflare Edge network. This single-page application provides a stunning, modern interface where users can input a target URL and select from a wide array of diagnostic tests.

These tests are grouped into 'Core Tests' (like HTTP, DNS, TLS, and Cache analysis) and 'Attach Tests' (for User-Agent specific behaviors like bot detection and rate limiting). Upon initiating the tests, the backend Cloudflare Worker executes them in parallel, returning real-time, detailed results to the dashboard. The results are displayed in beautifully designed, color-coded, collapsible cards, providing at-a-glance status and in-depth metrics.

## Key Features

-   **Comprehensive Core Tests**: Analyze HTTP headers, cache status, DNS records, TLS security, redirects, security headers, and more.
-   **Advanced Attach Tests**: Simulate various User-Agents to test for rate limiting, bot detection, and device-specific responses.
-   **Real-Time Results**: Watch as test results populate the dashboard live, directly from the Cloudflare Edge.
-   **Interactive UI**: A clean, modern, and fully responsive interface built for an intuitive user experience.
-   **Detailed Reporting**: Each test result is presented in a collapsible card with color-coded status indicators (OK, Warning, Fail) and detailed metrics.
-   **Powered by Cloudflare**: All diagnostics are run from a Cloudflare Worker, providing a realistic view of how your site performs on the network.

## Built With

-   **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Backend**: [Cloudflare Workers](https://workers.cloudflare.com/) with [Hono](https://hono.dev/)
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/edge_inspector.git
    cd edge_inspector
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

## Usage

### Running the Development Server

To start the local development server for both the frontend and the worker, run the following command. This will launch the Vite development server for the React application and a local instance of the Cloudflare Worker.

```sh
bun dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) to view the application in your browser.

## Deployment

This project is designed for easy deployment to Cloudflare's global network.

1.  **Build the application:**
    ```sh
    bun build
    ```

2.  **Deploy to Cloudflare Workers:**
    ```sh
    bun deploy
    ```

This command will build the frontend application, bundle the worker script, and deploy them to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cagdascf/edge-inspector)

## Project Structure

-   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Cloudflare Worker code, including the Hono router and test execution logic.
-   `wrangler.toml`: Configuration file for the Cloudflare Worker.
-   `vite.config.ts`: Configuration file for the Vite development server and build process.