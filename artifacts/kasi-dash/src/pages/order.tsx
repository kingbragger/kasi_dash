import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrder, useInitiateOzowPayment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const orderSchema = z.object({
  pickupAddress: z.string().min(3, "Pickup address is required"),
  deliveryAddress: z.string().min(3, "Delivery address is required"),
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(9, "Valid phone is required"),
  customerEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrderPage() {
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const initiatePayment = useInitiateOzowPayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pickupAddress: "",
      deliveryAddress: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      description: "",
      amount: 50,
    },
  });

  const onSubmit = async (values: OrderFormValues) => {
    setIsProcessing(true);
    try {
      // 1. Create order
      const order = await createOrder.mutateAsync({
        data: {
          pickupAddress: values.pickupAddress,
          deliveryAddress: values.deliveryAddress,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerEmail: values.customerEmail || undefined,
          description: values.description,
          amount: values.amount,
        }
      });

      // 2. Initiate payment
      const payment = await initiatePayment.mutateAsync({
        data: {
          orderId: order.id,
          amount: values.amount,
          customerName: values.customerName,
          customerEmail: values.customerEmail || "noreply@kasidash.com",
          customerPhone: values.customerPhone,
          description: values.description || "Kasi Dash Delivery",
        }
      });

      // 3. Redirect to payment
      window.location.href = payment.paymentUrl;
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <KasiDashLogo size="md" />
          </Link>
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Place your order</h1>
        
        <div className="bg-card border border-white/5 p-6 md:p-8 rounded-2xl shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pickup location" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter drop off location" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="082 123 4567" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are we delivering?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Groceries from Spar, keys left at home..." {...field} className="bg-background resize-none" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Amount (ZAR)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} className="bg-background text-lg font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg bg-primary text-primary-foreground hover:brightness-110 mt-4"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay with Ozow"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
