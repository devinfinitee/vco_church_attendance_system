import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import logo from "@assets/image_1764629926090.png";

const loginSchema = z.object({
  email: z.string().min(1, "Email/Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export default function Login() {
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const res = await fetch("https://vcoattendance.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }
      // Save token for subsequent requests
      localStorage.setItem("vco_token", data.token);
      setLocation("/admin");
    } catch (e: any) {
      alert(e.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          {/* Mesh Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#112255]/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <img
            src={logo}
            alt="VCO Logo"
            className="h-16 w-auto mb-8 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
            Victory Chapel <br /> Ogbomosho
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            "Serving the community with faith, tracking attendance with
            excellence."
          </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200/60 font-medium tracking-wide">
          CHURCH MANAGEMENT SYSTEM v2.0
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>
              <p className="text-gray-500">
                Please enter your credentials to access the admin dashboard.
              </p>
            </div>

            <div className="mt-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Email or Username
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="admin@church.com"
                              className="pl-10 h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-gray-700">
                            Password
                          </FormLabel>
                          <a
                            href="#"
                            className="text-sm font-medium text-primary hover:text-blue-900 transition-colors"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10 h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-gray-600 cursor-pointer">
                            Keep me logged in
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-blue-900 text-white font-semibold rounded-xl text-base shadow-lg shadow-blue-900/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px] group"
                  >
                    Sign in to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>

          <p className="px-8 text-center text-sm text-gray-500">
            <a
              href="/"
              className="hover:text-primary underline underline-offset-4"
            >
              Back to Attendance Form
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
