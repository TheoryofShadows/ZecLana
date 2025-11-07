import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransactionHistory } from "@/components/dashboard/transaction-history"

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  return <TransactionHistory transactions={transactions || []} />
}
