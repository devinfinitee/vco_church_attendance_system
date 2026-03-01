import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@assets/image_1764629926090.png";

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  isFirstTime: z.enum(["yes", "no"]),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address is required"),
  department: z.string().optional(),
  level: z.string().optional(),
});

export default function Attendance() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(format(new Date(), "MMMM dd, yyyy"));
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      isFirstTime: "no",
      dob: "",
      address: "",
      department: "",
      level: "",
    },
  });

  const department = form.watch("department");
  const isMedOrSurgery =
    department?.toLowerCase().includes("medicine") ||
    department?.toLowerCase().includes("surgery");

  const levels = ["100L", "200L", "300L", "400L", "500L", "Graduate", "Not a Student", "Working Class"];
  if (isMedOrSurgery) {
    levels.push("600L");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Prepare data for API
      const attendanceData = {
        name: values.fullName,
        address: values.address,
        DOB: values.dob,
        level: values.level || "N/A",
        dept: values.department || "N/A",
        phone: values.phone,
      };

      // Submit to backend API
      
      const response = await fetch("https://vcoattendance.onrender.com/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        console.error("Submission failed:", result.message);
        alert("Failed to submit attendance. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("An error occurred. Please try again.");
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-gradient-to-br from-green-300/40 to-emerald-400/40 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-br from-teal-300/40 to-cyan-400/40 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 right-1/4 w-40 h-40 border-4 border-white/20 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/4 w-32 h-32 border-4 border-white/15 rounded-full"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="max-w-lg w-full bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-12 text-center relative z-10 overflow-hidden"
        >
          {/* Decorative gradient border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
          
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-cyan-50/30 pointer-events-none"></div>
          
          <div className="relative z-10">
            <motion.div 
              className="w-28 h-28 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/50 relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
              >
                <Check className="w-14 h-14 text-white stroke-[3]" />
              </motion.div>
            </motion.div>
            
            <motion.h2 
              className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Thank You for Attending!
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 mb-3 text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your presence has been successfully recorded.
            </motion.p>
            
            <motion.p 
              className="text-gray-500 mb-10 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              We're blessed to have you worship with us today!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white h-14 rounded-2xl font-bold shadow-2xl shadow-teal-600/30 transition-all duration-300 hover:shadow-teal-600/50 hover:scale-[1.02] active:scale-[0.98] text-base relative overflow-hidden group"
              >
                <span className="relative z-10">Submit Another Attendance</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </motion.div>
            
            <motion.p 
              className="text-sm text-gray-400 mt-8 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              ✨ God bless you! ✨
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Multiple gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-blue-300 to-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border-4 border-white/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-20 w-40 h-40 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-2/3 left-1/4 w-24 h-24 border-2 border-white/15 rounded-full"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-white/25 rounded-full animate-pulse animation-delay-4000"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[540px] space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              {/* Glowing effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 rounded-full blur-3xl opacity-60 scale-150"></div>
              <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-40 scale-125"></div>
              <div className="relative bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-2xl ring-4 ring-white/50">
                <img
                  src={logo}
                  alt="Victory Chapel Logo"
                  className="h-24 w-auto object-contain relative z-10"
                />
              </div>
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to VCO
          </motion.h1>
          <motion.p 
            className="text-xl text-white/95 font-semibold drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Sunday Service Attendance
          </motion.p>
          <motion.p 
            className="text-sm text-white/80 drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Please fill the form below to register your presence
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="border-none shadow-2xl shadow-black/20 rounded-3xl overflow-hidden bg-white/98 backdrop-blur-xl relative">
            {/* Card decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
            
            {/* Glass morphism effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-transparent pointer-events-none"></div>
            
            <CardContent className="p-8 sm:p-10 relative z-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              <Input
                                placeholder="Enter full name"
                                className="relative h-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              <Input
                                placeholder="e.g. 0803 123 4567"
                                className="relative h-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="isFirstTime"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-700 font-medium block">
                            Are you a first-time visitor?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                            >
                              <FormItem className="flex-1">
                                <FormControl>
                                  <div className="relative">
                                    <RadioGroupItem
                                      value="yes"
                                      id="yes"
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor="yes"
                                      className="flex items-center justify-center w-full h-14 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-semibold cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-transparent peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-blue-500 peer-data-[state=checked]:via-purple-500 peer-data-[state=checked]:to-pink-500 peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-xl peer-data-[state=checked]:shadow-purple-500/50 hover:border-blue-300 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                                    >
                                      Yes
                                    </Label>
                                  </div>
                                </FormControl>
                              </FormItem>
                              <FormItem className="flex-1">
                                <FormControl>
                                  <div className="relative">
                                    <RadioGroupItem
                                      value="no"
                                      id="no"
                                      className="peer sr-only"
                                    />
                                    <Label
                                      htmlFor="no"
                                      className="flex items-center justify-center w-full h-14 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-semibold cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-transparent peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-blue-500 peer-data-[state=checked]:via-purple-500 peer-data-[state=checked]:to-pink-500 peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-xl peer-data-[state=checked]:shadow-purple-500/50 hover:border-blue-300 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                                    >
                                      No
                                    </Label>
                                  </div>
                                </FormControl>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Date of Birth
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              <Input
                                type="text"
                                placeholder="DD/MM"
                                className="relative h-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              <Input
                                placeholder="Your residential address"
                                className="relative h-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Department
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              <Input
                                placeholder="e.g. Computer Science"
                                className="relative h-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base shadow-sm hover:shadow-md"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Level
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                <SelectTrigger className="relative h-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base shadow-sm hover:shadow-md">
                                  <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                              </div>
                            </FormControl>
                            <SelectContent>
                              {levels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="pt-2"
                  >
                    <div className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 border-2 border-blue-200/50 flex items-center px-5 text-gray-800 text-base font-semibold shadow-inner">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      Today: {todayStr}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg font-bold shadow-2xl shadow-purple-500/40 transition-all duration-300 hover:shadow-purple-500/60 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 relative overflow-hidden group"
                    >
                      <span className="relative z-10">Submit Attendance</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-white/70 flex items-center justify-center gap-2 drop-shadow-md"
        >
          <div className="h-px w-12 bg-white/40"></div>
          <span>&copy; 2026 Victory Chapel Ogbomosho</span>
          <div className="h-px w-12 bg-white/40"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
