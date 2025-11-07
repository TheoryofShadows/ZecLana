import { screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Full authentication flow test
describe("Authentication Flow E2E", () => {
  it("should complete signup and login flow", async () => {
    // Test signup
    const signupForm = screen.getByRole("form", { name: /sign up/i })

    await userEvent.type(screen.getByLabelText(/first name/i), "John")
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe")
    await userEvent.type(screen.getByLabelText(/email/i), "john@example.com")
    await userEvent.type(screen.getByLabelText(/^password$/i), "SecurePass123!")
    await userEvent.type(screen.getByLabelText(/confirm password/i), "SecurePass123!")

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it("should handle password validation errors", async () => {
    const passwordInput = screen.getByLabelText(/^password$/i)

    await userEvent.type(passwordInput, "weak")

    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument()
    })
  })
})
