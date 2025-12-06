import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check, ChevronDown } from "lucide-react";
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

  const levels = ["100L", "200L", "300L", "400L", "500L"];
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Thank you for attending!
          </h2>
          <p className="text-gray-500 mb-8">Your presence has been recorded.</p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-blue-900 text-white h-12 rounded-xl font-semibold"
          >
            Go back home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <img
              src={logo}
              alt="Victory Chapel Logo"
              className="h-20 w-auto object-contain drop-shadow-sm"
            />
          </motion.div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Welcome to VCO Sunday Service Attendance
          </h1>
          <p className="text-base text-gray-500">
            Please fill the form to register your presence
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
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
                          <Input
                            placeholder="Enter full name"
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            {...field}
                          />
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
                          <Input
                            placeholder="e.g. 0803 123 4567"
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            {...field}
                          />
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
                                    className="flex items-center justify-center w-full h-12 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-600 font-medium cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white hover:bg-gray-100"
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
                                    className="flex items-center justify-center w-full h-12 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-600 font-medium cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white hover:bg-gray-100"
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
                  className="grid grid-cols-1 gap-6"
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
                          <Input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your residential address"
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            {...field}
                          />
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
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Department
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Medicine"
                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            {...field}
                          />
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
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
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
                  <div className="h-12 w-full rounded-xl bg-gray-100 flex items-center px-4 text-gray-500 text-sm font-medium cursor-not-allowed">
                    Today's Date: {todayStr}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl bg-primary hover:bg-blue-900 text-white text-lg font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Submit Attendance
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-400"
        >
          &copy; 2025 Victory Chapel Ogbomosho
        </motion.div>
      </motion.div>
    </div>
  );
}
