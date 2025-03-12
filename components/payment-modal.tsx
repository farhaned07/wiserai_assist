"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreditCard, CheckCircle2 } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: "en" | "bn"
}

export default function PaymentModal({ open, onOpenChange, language }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const translations = {
    en: {
      title: "Upgrade to Wiser Premium",
      description: "Get unlimited access to all features",
      paymentMethods: "Payment Methods",
      bkash: "bKash",
      nagad: "Nagad",
      rocket: "Rocket",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "Enter your phone number",
      price: "Price: 100 BDT / month",
      pay: "Pay Now",
      processing: "Processing...",
      success: "Payment Successful!",
      continue: "Continue",
    },
    bn: {
      title: "ওয়াইজার প্রিমিয়ামে আপগ্রেড করুন",
      description: "সমস্ত বৈশিষ্ট্যে অসীমিত অ্যাক্সেস পান",
      paymentMethods: "পেমেন্ট পদ্ধতি",
      bkash: "বিকাশ",
      nagad: "নগদ",
      rocket: "রকেট",
      phoneNumber: "ফোন নম্বর",
      phoneNumberPlaceholder: "আপনার ফোন নম্বর লিখুন",
      price: "মূল্য: ১০০ টাকা / মাস",
      pay: "এখন পেমেন্ট করুন",
      processing: "প্রক্রিয়াকরণ হচ্ছে...",
      success: "পেমেন্ট সফল হয়েছে!",
      continue: "চালিয়ে যান",
    },
  }

  const t = translations[language]

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
    }, 2000)
  }

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false)
      setPhoneNumber("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">{t.paymentMethods}</h4>
              <RadioGroup
                defaultValue="bkash"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex flex-col space-y-2"
              >
                {[
                  { value: "bkash", label: t.bkash, color: "bg-pink-600" },
                  { value: "nagad", label: t.nagad, color: "bg-orange-600" },
                  { value: "rocket", label: t.rocket, color: "bg-purple-600" },
                ].map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label htmlFor={method.value} className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${method.color}`}
                      >
                        <CreditCard className="h-3 w-3" />
                      </span>
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.phoneNumber}</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phoneNumberPlaceholder}
                className="rounded-xl"
              />
            </div>

            <div className="text-sm font-medium">{t.price}</div>

            <DialogFooter className="sm:justify-start">
              <Button
                type="button"
                onClick={handlePayment}
                disabled={!phoneNumber || isProcessing}
                className="w-full rounded-full"
              >
                {isProcessing ? t.processing : t.pay}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-semibold text-center">{t.success}</h3>
            <Button onClick={handleClose} className="w-full rounded-full">
              {t.continue}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

