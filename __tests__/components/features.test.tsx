import { render, screen } from "@testing-library/react"
import { Features } from "@/components/features"

describe("Features Component", () => {
  it("should render features section heading", () => {
    render(<Features />)
    const heading = screen.getByText(/The fusion of Zcash \+ Solana \+ Helius/i)
    expect(heading).toBeInTheDocument()
  })

  it("should render features description", () => {
    render(<Features />)
    const description = screen.getByText(/Bitcoin-grade privacy. Solana scalability/i)
    expect(description).toBeInTheDocument()
  })

  it("should render all six feature cards", () => {
    render(<Features />)
    expect(screen.getByText(/Bitcoin-Grade Privacy/)).toBeInTheDocument()
    expect(screen.getByText(/Solana Speed/)).toBeInTheDocument()
    expect(screen.getByText(/Truly Borderless/)).toBeInTheDocument()
    expect(screen.getByText(/Helius Reliability/)).toBeInTheDocument()
    expect(screen.getByText(/Earn While Bridged/)).toBeInTheDocument()
    expect(screen.getByText(/Self-Custody Only/)).toBeInTheDocument()
  })

  it("should render feature descriptions", () => {
    render(<Features />)
    expect(screen.getByText(/zk-SNARKs ensure sender/i)).toBeInTheDocument()
    expect(screen.getByText(/Sub-second finality/i)).toBeInTheDocument()
    expect(screen.getByText(/No geographic restrictions/i)).toBeInTheDocument()
  })
})
