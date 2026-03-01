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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
          {/* Mesh Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={logo}
              alt="VCO Logo"
              className="h-20 w-auto mb-10 drop-shadow-2xl"
            />
            <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6 drop-shadow-lg">
              Victory Chapel <br /> Ogbomosho
            </h1>
            <p className="text-blue-100 text-xl max-w-md leading-relaxed font-light">
              "Serving the community with faith, tracking attendance with excellence."
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="relative z-10 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-400/50"></div>
          <span className="text-sm text-blue-300/80 font-medium tracking-wider">CHURCH MANAGEMENT SYSTEM v2.0</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-400/50"></div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col space-y-3 text-center lg:text-left">
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-lg">
                Sign in to access your admin dashboard
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
                        <FormLabel className="text-gray-700 font-medium text-base">
                          Email or Username
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="admin@church.com"
                              className="pl-12 h-14 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base"
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
                          <FormLabel className="text-gray-700 font-medium text-base">
                            Password
                          </FormLabel>
                          <a
                            href="#"
                            className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-12 h-14 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base"
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
                    className="w-full h-14 bg-gradient-to-r from-primary via-blue-600 to-blue-700 hover:from-blue-900 hover:via-blue-800 hover:to-blue-900 text-white font-bold rounded-2xl text-base shadow-2xl shadow-blue-900/30 transition-all duration-300 hover:shadow-blue-900/50 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 group"
                  >
                    Sign in to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>

          <motion.p 
            className="text-center text-sm text-gray-500 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="h-px w-12 bg-gray-300"></div>
            <a
              href="/"
              className="hover:text-primary font-medium transition-colors underline-offset-4 hover:underline"
            >
              Back to Attendance Form
            </a>
            <div className="h-px w-12 bg-gray-300"></div>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
