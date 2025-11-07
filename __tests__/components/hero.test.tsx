import { render, screen } from "@testing-library/react"
import { Hero } from "@/components/hero"
import jest from "jest"

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

describe("Hero Component", () => {
  it("should render hero section with title", () => {
    render(<Hero />)
    const title = screen.getByText(/Send like Satoshi dreamed/i)
    expect(title).toBeInTheDocument()
  })

  it("should render the main tagline with privacy emphasis", () => {
    render(<Hero />)
    const tagline = screen.getByText(/Private like Zcash. Instant like Solana/i)
    expect(tagline).toBeInTheDocument()
  })

  it("should render description text", () => {
    render(<Hero />)
    const description = screen.getByText(/Shield on Zcash. Bridge via Helius/i)
    expect(description).toBeInTheDocument()
  })

  it("should render call-to-action buttons", () => {
    render(<Hero />)
    const bridgeButton = screen.getByRole("link", { name: /Explore Zolana Bridge/i })
    const sendButton = screen.getByRole("link", { name: /Start Sending/i })
    expect(bridgeButton).toBeInTheDocument()
    expect(sendButton).toBeInTheDocument()
  })

  it("should render key statistics", () => {
    render(<Hero />)
    expect(screen.getByText(/\$0.01/)).toBeInTheDocument()
    expect(screen.getByText(/2sec/)).toBeInTheDocument()
    expect(screen.getByText(/∞/)).toBeInTheDocument()
  })

  it("should render feature badges", () => {
    render(<Hero />)
    expect(screen.getByText(/Avg. bridge fee/i)).toBeInTheDocument()
    expect(screen.getByText(/Solana finality/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy guarantee/i)).toBeInTheDocument()
  })
})
