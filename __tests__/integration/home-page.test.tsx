import { render, screen } from "@testing-library/react"
import Home from "@/app/page"
import jest from "jest" // Import jest to declare the variable

// Mock all child components to test page composition
jest.mock("@/components/navigation", () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}))

jest.mock("@/components/hero", () => ({
  Hero: () => <div data-testid="hero">Hero</div>,
}))

jest.mock("@/components/features", () => ({
  Features: () => <div data-testid="features">Features</div>,
}))

jest.mock("@/components/how-it-works", () => ({
  HowItWorks: () => <div data-testid="how-it-works">How It Works</div>,
}))

jest.mock("@/components/cta", () => ({
  CTA: () => <div data-testid="cta">CTA</div>,
}))

jest.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

describe("Home Page Integration", () => {
  it("should render all main sections", () => {
    render(<Home />)
    expect(screen.getByTestId("navigation")).toBeInTheDocument()
    expect(screen.getByTestId("hero")).toBeInTheDocument()
    expect(screen.getByTestId("features")).toBeInTheDocument()
    expect(screen.getByTestId("how-it-works")).toBeInTheDocument()
    expect(screen.getByTestId("cta")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })

  it("should render in correct order", () => {
    const { container } = render(<Home />)
    const main = container.querySelector("main")
    const children = main?.children
    expect(children?.[0]).toHaveAttribute("data-testid", "navigation")
    expect(children?.[1]).toHaveAttribute("data-testid", "hero")
  })
})
