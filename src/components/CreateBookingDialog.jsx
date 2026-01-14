// src/components/CreateBookingDialog.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, Mail, MapPin, Car, Tag, DollarSign, Package, Loader2, Home, Bird, Sparkles, X } from "lucide-react";
import { promoCodeService } from "@/services/promocodeService";
import { ALL_SERVICES, VENDORS, TIME_SLOTS } from "@/Data/bookingData";
import { toast } from "sonner";
import { useLoaderContext } from '@/context/LoaderContext';

// ✅ Booking Types
const BOOKING_TYPES = {
  VEHICLE: "vehicle",
  CHIMNEY: "chimney",
  DUCK_CLEANING: "duck-cleaning",
  OTHER: "other", // ✅ For Custom/Smart Import Services
};

// ✅ Get Icon Component (Moved outside)
const getIconComponent = (iconName) => {
  switch (iconName) {
    case "Car": return Car;
    case "Home": return Home;
    case "Bird": return Bird;
    default: return Car;
  }
};

const CreateBookingDialog = ({ open, onClose, onSubmit }) => {
  // ✅ Mode Selection State
  const [entryMode, setEntryMode] = useState(null); // null (selection) | 'manual' | 'smart'

  // ✅ Main Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
    date: "",
    timeSlot: "",
    webName: "",
    bookingType: BOOKING_TYPES.VEHICLE,
    vendorName: "",
    agentId: "", // ✅ Added for Agent linking
  });

  // ✅ Dynamic Booking State based on type
  const [bookingDetails, setBookingDetails] = useState({
    serviceType: "",
    package: "",
    additionalServices: [],
    // Chimney specific
    chimneyType: "",
    chimneySize: "",
    location: "",
    // Duck cleaning specific  
    duckCount: "",
    areaSize: "",
    // Vehicle specific
    vehicleType: "",
    variant: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    vehicleLength: "",
    specialRequirements: "",
    serviceName: "", // ✅ For Custom Services
  });

  // ✅ Promo Code State
  const [promoCodes, setPromoCodes] = useState([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);

  // ✅ Pricing State
  const [pricing, setPricing] = useState({
    totalPrice: 0,
    discountedPrice: 0,
    discountApplied: false,
    discountPercent: 0,
  });

  // ✅ Smart Import State
  const [smartInput, setSmartInput] = useState("");
  const [isManualPrice, setIsManualPrice] = useState(false);
  const [manualPrice, setManualPrice] = useState(0);

  // ✅ Manual Entry Toggles
  const [isManualBookingType, setIsManualBookingType] = useState(false);
  const [isManualServiceType, setIsManualServiceType] = useState(false);
  const [isManualVariant, setIsManualVariant] = useState(false);

  // ✅ Detect Booking Category from Input String (Helper)
  const detectBookingCategory = (input) => {
    if (!input) return BOOKING_TYPES.OTHER;
    const lower = input.toLowerCase();

    // Check if it matches existing keys exactly first
    const exactMatch = Object.values(BOOKING_TYPES).find(t => t === lower);
    if (exactMatch) return exactMatch;

    if (lower.includes('vehicle') || lower.includes('car') || lower.includes('auto') || lower.includes('truck') || lower.includes('detail')) return BOOKING_TYPES.VEHICLE;
    if (lower.includes('chimney') || lower.includes('fireplace')) return BOOKING_TYPES.CHIMNEY;
    if (lower.includes('duck') || lower.includes('duct') || lower.includes('air') || lower.includes('vent')) return BOOKING_TYPES.DUCK_CLEANING;

    return BOOKING_TYPES.OTHER;
  };

  // // ✅ Parse Smart Input
  // const handleSmartParse = () => {
  //   if (!smartInput) return;

  //   const lines = smartInput.split('\n');
  //   const parsedData = { ...formData, webName: "Facebook" }; // Set default Web Name
  //   const parsedDetails = { ...bookingDetails };
  //   let parsedPrice = 0;
  //   let foundPrice = false;

  //   // Helper to safely extract value
  //   // Updated Regex to consume one or more separators (:, -, =) and surrounding whitespace
  //   const extractValue = (line, regex) => {
  //     const match = line.match(regex);
  //     // Remove any leading separator chars like : or = just in case regex capture wasn't perfect
  //     return match ? match[1].replace(/^[:=\-\s]+/, '').trim() : null;
  //   };

  //   lines.forEach(line => {
  //     // Date
  //     const dateVal = extractValue(line, /(?:Appointment )?Date\s*[:=\-]+\s*(.+)/i);
  //     if (dateVal) {
  //        // Try to handle "18- December -2025" or similar
  //        const cleanDate = dateVal.replace(/\s*-\s*/g, ' ').replace(' ,', ','); 
  //        const dateObj = new Date(cleanDate);
  //        if (!isNaN(dateObj.getTime())) {
  //          parsedData.date = dateObj.toISOString().split('T')[0];
  //        }
  //     }

  //     // Time
  //     const timeVal = extractValue(line, /(?:Appointment )?Time\s*[:=\-]+\s*(.+)/i);
  //     if (timeVal && !timeVal.includes('---')) parsedData.timeSlot = timeVal;

  //     // Name (Split First/Last)
  //     const nameVal = extractValue(line, /(?:Full )?Name\s*[:=\-]+\s*(.+)/i);
  //     if (nameVal) {
  //       const parts = nameVal.trim().split(/\s+/);
  //       if (parts.length > 0) {
  //            parsedData.firstName = parts[0];
  //            parsedData.lastName = parts.slice(1).join(' ') || "";
  //       }
  //     }

  //     // Phone (single line)
  //     const phoneVal = extractValue(line, /(?:Phone|message|Cell)(?:\s*-\s*Cell)?\s*[:=\-]+\s*(.+)/i);
  //     if (phoneVal) parsedData.phone = phoneVal;

  //     // Email
  //     const emailVal = extractValue(line, /(?:Mail|Email)\s*[:=\-]+\s*(.+)/i);
  //     if (emailVal && !emailVal.includes('---')) parsedData.email = emailVal;

  //     // Address
  //     const addressVal = extractValue(line, /(?:Address|Location)\s*[:=\-]+\s*(.+)/i);
  //     if (addressVal) {
  //       parsedData.address = addressVal;
  //       const zipMatch = addressVal.match(/\b\d{5}(?:-\d{4})?\b/);
  //       if (zipMatch) parsedData.zip = zipMatch[0];
  //     }

  //     // Price
  //     const priceVal = extractValue(line, /(?:Price|Cost|Total)\s*[:=\-]+\s*[$€£]?([\d,.]+)/i);
  //     if (priceVal) {
  //       parsedPrice = parseFloat(priceVal.replace(/,/g, ''));
  //       if (!isNaN(parsedPrice)) foundPrice = true;
  //     }

  //     // Agent ID / Name
  //     const agentVal = extractValue(line, /(?:Agent)(?: Name)?\s*[:=\-]+\s*(.+)/i);
  //     if (agentVal) {
  //       parsedData.agentId = agentVal;
  //     }

  //     // Vendor / Company Name -> Map to vendorName
  //     const companyVal = extractValue(line, /(?:Company)(?: Name)?\s*[:=\-]+\s*(.+)/i);
  //     if (companyVal) {
  //       parsedData.vendorName = companyVal;
  //     }

  //     // Comments
  //     const notesVal = extractValue(line, /(?:Comments|Notes)\s*[:=\-]+\s*(.+)/i);
  //     if (notesVal) parsedData.notes = notesVal;

  //     // Service
  //     const serviceVal = extractValue(line, /(?:Service|Type)\s*[:=\-]+\s*(.+)/i);
  //     if (serviceVal) {
  //       // Try to match existing types first
  //       let matched = false;
  //       Object.values(BOOKING_TYPES).forEach(type => {
  //            const cat = ALL_SERVICES[type.toUpperCase()];
  //            if (cat && serviceVal.toLowerCase().includes(cat.name.toLowerCase())) {
  //                parsedData.bookingType = type;
  //                bookingDetails.serviceType = cat.services[0]?.id; // Default to first service
  //                matched = true;
  //            }
  //       });

  //       if (!matched) {
  //            // ✅ Handle Custom Service
  //            parsedData.bookingType = BOOKING_TYPES.OTHER;
  //            parsedDetails.serviceName = serviceVal;
  //       }
  //     }
  //   });

  //   // Multiline Phone Fix
  //   // Match "Phone ... :: \n (940) ..."
  //   if (!parsedData.phone) {
  //       const rawPhoneMatch = smartInput.match(/(?:\(\d{3}\) \d{3}-\d{4})|(?:\d{3}-\d{3}-\d{4})/);
  //       if (rawPhoneMatch) parsedData.phone = rawPhoneMatch[0];
  //   }

  //   setFormData(parsedData);
  //   setBookingDetails(parsedDetails);

  //   if (foundPrice) {
  //       setIsManualPrice(true);
  //       setManualPrice(parsedPrice);
  //       setPricing(prev => ({ 
  //           ...prev, 
  //           totalPrice: parsedPrice, 
  //           discountedPrice: parsedPrice 
  //       }));
  //   }

  //   // Switch to Manual Mode view to show the result -> Keep in Smart mode to keep the text box visible or switch?
  //   // User wants "us ke hissab se Data open kr wado". So showing the form below is best.
  //   toast.success("Details applied from text!");
  // };

  // ✅ Parse Smart Input
  const handleSmartParse = () => {
    if (!smartInput) return;

    const lines = smartInput.split('\n');
    const parsedData = { ...formData, webName: "Facebook" };
    const parsedDetails = { ...bookingDetails };
    let parsedPrice = 0;
    let foundPrice = false;

    // Helper to safely extract value
    const extractValue = (line, regex) => {
      const match = line.match(regex);
      return match ? match[1].replace(/^[:=\-\s]+/, '').trim() : null;
    };

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // 🔹 **FIRST PRIORITY: Full Name (exact match)**
      const fullNameVal = extractValue(trimmedLine, /^(?:Full\s+)?Name\s*[:=\-]+\s*(.+)/i);
      if (fullNameVal && !parsedData.firstName) {
        const parts = fullNameVal.trim().split(/\s+/);
        if (parts.length > 0) {
          parsedData.firstName = parts[0];
          parsedData.lastName = parts.slice(1).join(' ') || "";
        }
      }

      // 🔹 **Date**
      const dateVal = extractValue(trimmedLine, /(?:Appointment\s+)?Date\s*[:=\-]+\s*(.+)/i);
      if (dateVal) {
        const cleanDate = dateVal.replace(/\s*-\s*/g, ' ').replace(' ,', ',');
        const dateObj = new Date(cleanDate);
        if (!isNaN(dateObj.getTime())) {
          parsedData.date = dateObj.toISOString().split('T')[0];
        }
      }

      // 🔹 **Time**
      const timeVal = extractValue(trimmedLine, /(?:Appointment\s+)?Time\s*[:=\-]+\s*(.+)/i);
      if (timeVal && !timeVal.includes('---')) parsedData.timeSlot = timeVal;

      // 🔹 **Phone (single line)**
      const phoneVal = extractValue(trimmedLine, /(?:Phone|message|Cell)(?:\s*-\s*Cell)?\s*[:=\-]+\s*(.+)/i);
      if (phoneVal) {
        // Clean phone number (remove extra spaces, keep digits)
        const cleanPhone = phoneVal.replace(/\s+/g, '');
        parsedData.phone = cleanPhone;
      }

      // 🔹 **Email**
      const emailVal = extractValue(trimmedLine, /(?:Mail|Email)\s*[:=\-]+\s*(.+)/i);
      if (emailVal && !emailVal.includes('---')) parsedData.email = emailVal;

      // 🔹 **Address**
      const addressVal = extractValue(trimmedLine, /(?:Address|Location)\s*[:=\-]+\s*(.+)/i);
      if (addressVal) {
        parsedData.address = addressVal;
        const zipMatch = addressVal.match(/\b\d{5}(?:-\d{4})?\b/);
        if (zipMatch) parsedData.zip = zipMatch[0];
      }

      // 🔹 **Price**
      const priceVal = extractValue(trimmedLine, /(?:Price|Cost|Total)\s*[:=\-]+\s*[$€£]?([\d,.]+)/i);
      if (priceVal) {
        parsedPrice = parseFloat(priceVal.replace(/,/g, ''));
        if (!isNaN(parsedPrice)) foundPrice = true;
      }

      // 🔹 **Agent ID / Name**
      const agentVal = extractValue(trimmedLine, /(?:Agent)(?:\s+Name)?\s*[:=\-]+\s*(.+)/i);
      if (agentVal) {
        parsedData.agentId = agentVal;
      }

      // 🔹 **Vendor / Company Name -> Map to vendorName**
      const companyVal = extractValue(trimmedLine, /(?:Company\s+Name|Company\s+name)\s*[:=\-]+\s*(.+)/i);
      if (companyVal) {
        parsedData.vendorName = companyVal.replace(/^\*|\*$/g, '').trim();
      }

      // 🔹 **Comments**
      const notesVal = extractValue(trimmedLine, /(?:Comments|Notes)\s*[:=\-]+\s*(.+)/i);
      if (notesVal) parsedData.notes = notesVal.replace(/^\*|\*$/g, '').trim();

      // 🔹 **Service**
      const serviceVal = extractValue(trimmedLine, /(?:Service|Type)\s*[:=\-]+\s*(.+)/i);
      if (serviceVal) {
        // Try to match existing types first
        let matched = false;
        Object.values(BOOKING_TYPES).forEach(type => {
          const cat = ALL_SERVICES[type.toUpperCase()];
          if (cat && serviceVal.toLowerCase().includes(cat.name.toLowerCase())) {
            parsedData.bookingType = type;
            bookingDetails.serviceType = cat.services[0]?.id;
            matched = true;
          }
        });

        if (!matched) {
          // ✅ Handle Custom Service
          parsedData.bookingType = BOOKING_TYPES.OTHER;
          parsedDetails.serviceName = serviceVal;
        }
      }
    });

    // 🔹 **Multiline Phone Fix**
    if (!parsedData.phone) {
      const phoneRegex = /(?:\(\d{3}\)\s*\d{3}-\d{4})|(?:\d{3}-\d{3}-\d{4})/;
      const phoneMatch = smartInput.match(phoneRegex);
      if (phoneMatch) {
        parsedData.phone = phoneMatch[0].replace(/\s+/g, '');
      }
    }

    // 🔹 **Fallback for Name if still not found**
    if (!parsedData.firstName) {
      // Look for any line that might contain a name pattern
      const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+/;
      const possibleNameLine = lines.find(line => namePattern.test(line.trim()));
      if (possibleNameLine) {
        const nameParts = possibleNameLine.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          parsedData.firstName = nameParts[0];
          parsedData.lastName = nameParts.slice(1).join(' ');
        }
      }
    }

    setFormData(parsedData);
    setBookingDetails(parsedDetails);

    if (foundPrice) {
      setIsManualPrice(true);
      setManualPrice(parsedPrice);
      setPricing(prev => ({
        ...prev,
        totalPrice: parsedPrice,
        discountedPrice: parsedPrice
      }));
    }

    toast.success("Details applied from text!");
  };

  // ✅ Loader Context
  const { showLoader, hideLoader } = useLoaderContext();

  // ✅ Reset Form
  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      notes: "",
      date: "",
      timeSlot: "",
      webName: "",
      bookingType: BOOKING_TYPES.VEHICLE,
      vendorName: "",
      agentId: "",
    });
    setBookingDetails({
      serviceType: "",
      package: "",
      additionalServices: [],
      chimneyType: "",
      chimneySize: "",
      location: "",
      duckCount: "",
      areaSize: "",
      vehicleType: "",
      variant: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      vehicleLength: "",
      specialRequirements: "",
      serviceName: "",
    });
    setSelectedPromoCode(null);
    setPricing({
      totalPrice: 0,
      discountedPrice: 0,
      discountApplied: false,
      discountPercent: 0,
    });
  }, []);

  // ✅ Fetch Promo Codes
  const fetchPromoCodes = useCallback(async () => {
    try {
      setLoadingPromoCodes(true);
      const response = await promoCodeService.getAllPromoCodes({ limit: 100 });
      setPromoCodes(response.data || []);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      toast.error("Failed to fetch promo codes");
    } finally {
      setLoadingPromoCodes(false);
    }
  }, []);

  // ✅ Fetch Promo Codes on Open
  useEffect(() => {
    if (open) {
      setEntryMode(null); // Reset to selection screen
      setIsManualPrice(false);
      setManualPrice(0);
      setSmartInput("");
      fetchPromoCodes();
      resetForm();
    }
  }, [open, fetchPromoCodes, resetForm]);



  // ✅ Apply Promo Code
  const applyPromoCode = (promoId) => {
    if (promoId === "none") {
      setSelectedPromoCode(null);
      return;
    }

    const promo = promoCodes.find(p => p._id === promoId);
    if (promo) {
      setSelectedPromoCode(promo);
    } else {
      setSelectedPromoCode(null);
    }
  };

  // ✅ Handle Form Input Changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Handle Booking Details Changes
  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => {
      const updated = { ...prev, [field]: value };

      // Reset dependent fields when service type changes
      if (field === "serviceType") {
        updated.package = "";
        updated.additionalServices = [];
        updated.variant = "";
        updated.vehicleType = "";
      }

      // Reset package when variant changes
      if (field === "variant") {
        updated.package = "";
        updated.additionalServices = [];
      }

      if (field === "package") {
        // Auto-set main service name from package
        const selectedPackage = getPackages().find(p => p.id === value);
        if (selectedPackage) {
          console.log("Selected Package:", selectedPackage.name);
        }
      }

      return updated;
    });
  };

  // ✅ Get current service category
  const getCurrentServiceCategory = () => {
    const type = detectBookingCategory(formData.bookingType);
    return ALL_SERVICES[type.toUpperCase()];
  };

  // ✅ Get available services for current booking type
  const getServices = () => {
    const category = getCurrentServiceCategory();
    return category?.services || [];
  };

  // ✅ Get currently selected service (by ID or Name)
  const getSelectedService = () => {
    const services = getServices();
    if (!services) return null;
    return services.find(s => s.id === bookingDetails.serviceType || s.name === bookingDetails.serviceType) || null;
  };

  // ✅ Get variants for vehicle service
  const getVariants = () => {
    if (detectBookingCategory(formData.bookingType) !== BOOKING_TYPES.VEHICLE) return [];
    const selectedService = getSelectedService();
    return selectedService?.variants || [];
  };

  // ✅ Get packages for selected service (with variant support)
  const getPackages = () => {
    const selectedService = getSelectedService();

    if (!selectedService) return [];

    // If service has variants, get packages from selected variant
    if (selectedService.variants && selectedService.variants.length > 0) {
      if (!bookingDetails.variant) return [];
      // Variant usually matched by ID, now maybe by name too if I change variant to input
      const selectedVariant = selectedService.variants.find(v => v.id === bookingDetails.variant || v.name === bookingDetails.variant);
      return selectedVariant?.packages || [];
    }

    // Otherwise, get packages directly from service
    return selectedService?.packages || [];
  };

  // ✅ Get additional services for selected service (with variant support)
  const getAdditionalServices = () => {
    const selectedService = getSelectedService();

    if (!selectedService) return [];

    // If service has variants, get additional services from selected variant
    if (selectedService.variants && selectedService.variants.length > 0) {
      if (!bookingDetails.variant) return [];
      const selectedVariant = selectedService.variants.find(v => v.id === bookingDetails.variant || v.name === bookingDetails.variant);
      return selectedVariant?.additionalServices || [];
    }

    // Otherwise, get additional services directly from service
    return selectedService?.additionalServices || [];
  };

  // ✅ Calculate Price based on booking type
  const calculatePrice = () => {
    let totalPrice = 0;

    const selectedPackage = getPackages().find(p => p.id === bookingDetails.package);

    if (selectedPackage) {
      let packagePrice = selectedPackage.price;

      // Apply per-foot pricing for vehicles
      if (selectedPackage.pricingType === "perFoot" && bookingDetails.vehicleLength) {
        packagePrice = packagePrice * parseFloat(bookingDetails.vehicleLength || 0);
      }

      totalPrice += packagePrice;
    }

    // Add additional services
    const additionalServices = getAdditionalServices();
    bookingDetails.additionalServices?.forEach(serviceId => {
      const service = additionalServices.find(s => s.id === serviceId);
      if (service) {
        totalPrice += service.price;
      }
    });

    return totalPrice;
  };

  // ✅ Auto-calculate pricing
  useEffect(() => {
    let totalPrice = 0;

    if (isManualPrice) {
      totalPrice = manualPrice;
    } else {
      totalPrice = calculatePrice();
    }

    const discount = selectedPromoCode?.discountPercentage || 0;
    const discounted = totalPrice - (totalPrice * discount) / 100;

    setPricing({
      totalPrice,
      discountedPrice: discounted,
      discountApplied: !!selectedPromoCode,
      discountPercent: discount,
    });
  }, [bookingDetails, selectedPromoCode, formData.bookingType, isManualPrice, manualPrice]);

  // ✅ Toggle Additional Service
  const toggleAdditionalService = (serviceId) => {
    const services = bookingDetails.additionalServices || [];
    const isSelected = services.includes(serviceId);

    handleBookingDetailsChange(
      "additionalServices",
      isSelected
        ? services.filter((s) => s !== serviceId)
        : [...services, serviceId]
    );
  };

  // ✅ Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation (Relaxed for Smart Import / Manual Mode)
    const isManualMode = isManualPrice || smartInput.length > 0;

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill all required customer fields");
      return;
    }

    if (!formData.webName) {
      toast.error("Please enter the website/source name");
      return;
    }

    if (!formData.vendorName) {
      toast.error("Please select a vendor");
      return;
    }

    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    if (!isManualMode) {
      if (!bookingDetails.serviceType || !bookingDetails.package) {
        // Only enforce this for standard types, skip for manually entered generic types if needed?
        // Actually, if detectBookingCategory returns OTHER or valid type, we might want to enforce.
        // But if user typed "Car Washing" manually, getServices might be empty, so no packages.
        // So we should relax this if package list is empty?
        // User requested Manual Input.
        if (getPackages().length > 0) {
          toast.error("Please select service type and package");
          return;
        }
      }

      // ✅ Vehicle specific validation
      if (detectBookingCategory(formData.bookingType) === BOOKING_TYPES.VEHICLE) {
        if (!bookingDetails.vehicleMake || !bookingDetails.vehicleModel || !bookingDetails.vehicleYear) {
          // Only enforce if we are strictly in vehicle mode and not just "Other"
          toast.error("Please fill all vehicle details");
          return;
        }

        // Validate vehicle length for per-foot pricing
        const selectedPackage = getPackages().find(p => p.id === bookingDetails.package);
        if (selectedPackage?.pricingType === "perFoot" && !bookingDetails.vehicleLength) {
          toast.error("Vehicle length is required for per-foot pricing");
          return;
        }
      }
    }

    // ✅ Generate Booking ID
    const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    // ✅ Prepare booking data
    const bookingData = {
      bookingId,
      webName: formData.webName,
      vendorName: formData.vendorName,
      bookingType: formData.bookingType, // Save the actual input string
      agentId: formData.agentId || null, // ✅ Send Agent ID
      formData: {
        ...formData,
        bookingDetails: {
          ...bookingDetails,
          // Include service name for reference
          serviceName: getServices().find(s => s.id === bookingDetails.serviceType)?.name || bookingDetails.serviceName || bookingDetails.serviceType,
          packageName: getPackages().find(p => p.id === bookingDetails.package)?.name,
        },
      },
      totalPrice: pricing.totalPrice,
      discountedPrice: pricing.discountedPrice,
      discountApplied: pricing.discountApplied,
      discountPercent: pricing.discountPercent,
      promoCode: selectedPromoCode?.promoCode || null,
      promoCodeId: selectedPromoCode?._id || null,
      submittedAt: new Date().toISOString(),
      vehicleCount: detectBookingCategory(formData.bookingType) === BOOKING_TYPES.VEHICLE ? 1 : 0,
      serviceCount: 1,
      status: "pending",
    };

    try {
      showLoader("create-booking", "Creating booking...");
      const res = await onSubmit(bookingData);

      if (res && res.success) {
        resetForm();
        if (onClose) onClose();
        toast.success("Booking created successfully!");
      } else if (res && !res.success) {
        toast.error(res.message || "Failed to create booking");
      } else {
        resetForm();
        if (onClose) onClose();
        toast.success("Booking created successfully!");
      }
    } catch (err) {
      console.error("Create booking error:", err);
      toast.error(err?.message || "Failed to create booking");
    } finally {
      hideLoader("create-booking");
    }
  };



  const CurrentIcon = useMemo(() => {
    return getIconComponent(getCurrentServiceCategory()?.icon) || Sparkles;
  }, [formData.bookingType]);

  // ✅ Scroll Lock Effect for Custom Inline Modal
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🟢 CUSTOM HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Create New Booking</h2>
            <p className="text-sm text-slate-500">Enter booking details manually or import directly from text.</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100 h-10 w-10"
          >
            <X className="w-6 h-6 text-slate-500" />
          </Button>
        </div>

        {/* 🟢 SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50">

          {/* VIEW 1: MODE SELECTION */}
          {!entryMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center justify-center p-10">
              <button
                onClick={() => setEntryMode('manual')}
                className="flex flex-col items-center justify-center space-y-4 p-10 border-2 border-dashed rounded-xl hover:bg-slate-50 hover:border-blue-500 transition-all group"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700">Manual Entry</h3>
                <p className="text-muted-foreground text-center">Fill out the form fields manually step-by-step.</p>
              </button>

              <button
                onClick={() => setEntryMode('smart')}
                className="flex flex-col items-center justify-center space-y-4 p-10 border-2 border-dashed rounded-xl hover:bg-indigo-50 hover:border-indigo-500 transition-all group"
              >
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-indigo-900">Smart Import</h3>
                <p className="text-muted-foreground text-center">Paste booking details from text to auto-fill.</p>
              </button>
            </div>
          ) : (
            /* VIEW 2: FORM / SMART IMPORT */
            <div className="max-w-7xl mx-auto space-y-6">

              {/* BACK BUTTON */}
              <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => setEntryMode(null)} className="gap-2">
                  ← Back to Selection
                </Button>
                {entryMode === 'smart' && (
                  <div className="text-indigo-700 font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Smart Import Mode
                  </div>
                )}
              </div>

              {/* SMART IMPORT INPUT (Only visible in Smart Mode + Not yet filled or always visible to re-paste?) */}
              {entryMode === 'smart' && (
                <Card className="border-indigo-200 bg-indigo-50/30 mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-indigo-700">Paste Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        id="smartInput"
                        value={smartInput}
                        onChange={(e) => setSmartInput(e.target.value)}
                        placeholder={`Paste here...`}
                        className="min-h-[150px] border-indigo-200 focus-visible:ring-indigo-500 font-mono text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSmartParse}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Parse & Auto-Fill Form
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* FORM (Hidden in Smart Mode until parsed? Or just shown below. Let's show below so they can see result) */}
              {/* If Manual Mode OR (Smart Mode AND Form was parsed i.e. we have data) */}
              {(entryMode === 'manual' || (entryMode === 'smart')) && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  {/* 📋 CUSTOMER INFORMATION */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="customer@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            required
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* BOOKING TYPE & VENDOR */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="bookingType">Booking Type <span className="text-red-500">*</span></Label>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="manualBookingType"
                                checked={isManualBookingType}
                                onCheckedChange={(checked) => setIsManualBookingType(checked)}
                              />
                              <label htmlFor="manualBookingType" className="text-xs text-muted-foreground cursor-pointer">
                                Manual Entry
                              </label>
                            </div>
                          </div>
                          {isManualBookingType ? (
                            <Input
                              id="bookingType"
                              value={formData.bookingType}
                              onChange={(e) => handleInputChange("bookingType", e.target.value)}
                              placeholder="Type booking type"
                            />
                          ) : (
                            <Select
                              value={formData.bookingType}
                              onValueChange={(value) => handleInputChange("bookingType", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select booking type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(BOOKING_TYPES).map((type) => {
                                  const category = ALL_SERVICES[type.toUpperCase()];
                                  const IconComponent = getIconComponent(category?.icon);
                                  return (
                                    <SelectItem key={type} value={type}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="w-4 h-4" />
                                        {category?.name}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vendorName">Vendor Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="vendorName"
                            value={formData.vendorName}
                            onChange={(e) => handleInputChange("vendorName", e.target.value)}
                            placeholder="Enter vendor name (e.g., AutoClean Experts, John's Detailing)"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            You can type any vendor name
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* WEB NAME FIELD */}
                      <div className="space-y-2">
                        <Label htmlFor="webName">Website/Source Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="webName"
                          value={formData.webName}
                          onChange={(e) => handleInputChange("webName", e.target.value)}
                          placeholder="e.g., Admin Dashboard, Website, Mobile App"
                          required
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input
                            id="zip"
                            value={formData.zip}
                            onChange={(e) => handleInputChange("zip", e.target.value)}
                            placeholder="ZIP"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 📅 APPOINTMENT DETAILS */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5" />
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Appointment Date <span className="text-red-500">*</span></Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeSlot">Time Slot <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.timeSlot}
                            onValueChange={(value) => handleInputChange("timeSlot", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                  {slot.replace('-', ' AM - ')} PM
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 🎯 SERVICE DETAILS */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CurrentIcon className="w-5 h-5" />
                        {getCurrentServiceCategory()?.name} Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Service Type Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Service Type <span className="text-red-500">*</span></Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="manualServiceType"
                              checked={isManualServiceType}
                              onCheckedChange={(checked) => setIsManualServiceType(checked)}
                            />
                            <label htmlFor="manualServiceType" className="text-xs text-muted-foreground cursor-pointer">
                              Manual Entry
                            </label>
                          </div>
                        </div>
                        {isManualServiceType ? (
                          <Input
                            value={bookingDetails.serviceType}
                            onChange={(e) => handleBookingDetailsChange("serviceType", e.target.value)}
                            placeholder={`Type ${getCurrentServiceCategory()?.name.toLowerCase() || 'service'} type`}
                          />
                        ) : (
                          <Select
                            value={bookingDetails.serviceType}
                            onValueChange={(value) => handleBookingDetailsChange("serviceType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${getCurrentServiceCategory()?.name.toLowerCase()} service`} />
                            </SelectTrigger>
                            <SelectContent>
                              {getServices().map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Variant Selection (for Car Detailing) */}
                      {getVariants().length > 0 && bookingDetails.serviceType && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label>Vehicle Type / Variant <span className="text-red-500">*</span></Label>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="manualVariant"
                                checked={isManualVariant}
                                onCheckedChange={(checked) => setIsManualVariant(checked)}
                              />
                              <label htmlFor="manualVariant" className="text-xs text-muted-foreground cursor-pointer">
                                Manual Entry
                              </label>
                            </div>
                          </div>
                          {isManualVariant ? (
                            <Input
                              value={bookingDetails.variant}
                              onChange={(e) => handleBookingDetailsChange("variant", e.target.value)}
                              placeholder="Type vehicle type"
                            />
                          ) : (
                            <Select
                              value={bookingDetails.variant}
                              onValueChange={(value) => handleBookingDetailsChange("variant", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle variant" />
                              </SelectTrigger>
                              <SelectContent>
                                {getVariants().map((variant) => (
                                  <SelectItem key={variant.id} value={variant.id}>
                                    {variant.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {isManualVariant ? 'Type your vehicle type' : 'Select your vehicle type for accurate pricing'}
                          </p>
                        </div>
                      )}

                      {/* Package Selection */}
                      {getPackages().length > 0 && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Package <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={bookingDetails.package}
                            onValueChange={(value) => handleBookingDetailsChange("package", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select package" />
                            </SelectTrigger>
                            <SelectContent>
                              {getPackages().map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  <div className="flex items-center justify-between gap-4">
                                    <span>{pkg.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ${pkg.price}
                                      {pkg.pricingType === "perFoot" && "/ft"}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {bookingDetails.package && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {getPackages().find(p => p.id === bookingDetails.package)?.description}
                            </p>
                          )}
                        </div>
                      )}


                      {/* Service Specific Fields */}
                      {bookingDetails.serviceType && (
                        <>
                          {detectBookingCategory(formData.bookingType) === BOOKING_TYPES.OTHER && (
                            <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                              <div className="space-y-2">
                                <Label>Custom Service Name</Label>
                                <Input
                                  value={bookingDetails.serviceName}
                                  onChange={(e) => handleBookingDetailsChange("serviceName", e.target.value)}
                                  placeholder="e.g. HVAC Cleaning"
                                />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Define the service details in the notes or requirements section.
                              </div>
                            </div>
                          )}

                          {detectBookingCategory(formData.bookingType) === BOOKING_TYPES.VEHICLE && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Vehicle Details */}
                              <div className="space-y-2">
                                <Label>Vehicle Make <span className="text-red-500">*</span></Label>
                                <Input
                                  value={bookingDetails.vehicleMake}
                                  onChange={(e) => handleBookingDetailsChange("vehicleMake", e.target.value)}
                                  placeholder="Toyota, Honda, etc."
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Vehicle Model <span className="text-red-500">*</span></Label>
                                <Input
                                  value={bookingDetails.vehicleModel}
                                  onChange={(e) => handleBookingDetailsChange("vehicleModel", e.target.value)}
                                  placeholder="Camry, Civic, etc."
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Vehicle Year <span className="text-red-500">*</span></Label>
                                <Input
                                  value={bookingDetails.vehicleYear}
                                  onChange={(e) => handleBookingDetailsChange("vehicleYear", e.target.value)}
                                  placeholder="2023"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Vehicle Color <span className="text-red-500">*</span></Label>
                                <Input
                                  value={bookingDetails.vehicleColor}
                                  onChange={(e) => handleBookingDetailsChange("vehicleColor", e.target.value)}
                                  placeholder="Black, White, etc."
                                  required
                                />
                              </div>

                              {/* Vehicle Length for per-foot pricing */}
                              {getPackages()?.some(p => p.pricingType === "perFoot") && (
                                <div className="space-y-2">
                                  <Label>Vehicle Length (feet) <span className="text-red-500">*</span></Label>
                                  <Input
                                    type="number"
                                    value={bookingDetails.vehicleLength}
                                    onChange={(e) => handleBookingDetailsChange("vehicleLength", e.target.value)}
                                    placeholder="Enter length in feet"
                                    required
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {detectBookingCategory(formData.bookingType) === BOOKING_TYPES.CHIMNEY && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {getSelectedService()?.chimneyTypes && (
                                <div className="space-y-2">
                                  <Label>Chimney Type</Label>
                                  <Select
                                    value={bookingDetails.chimneyType}
                                    onValueChange={(value) => handleBookingDetailsChange("chimneyType", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select chimney type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getSelectedService().chimneyTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                          {type.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {getSelectedService()?.chimneySizes && (
                                <div className="space-y-2">
                                  <Label>Chimney Size</Label>
                                  <Select
                                    value={bookingDetails.chimneySize}
                                    onValueChange={(value) => handleBookingDetailsChange("chimneySize", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getSelectedService().chimneySizes.map((size) => (
                                        <SelectItem key={size.id} value={size.id}>
                                          {size.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                  value={bookingDetails.location}
                                  onChange={(e) => handleBookingDetailsChange("location", e.target.value)}
                                  placeholder="e.g., Kitchen, Living Room, etc."
                                />
                              </div>
                            </div>
                          )}

                          {detectBookingCategory(formData.bookingType) === BOOKING_TYPES.DUCK_CLEANING && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Duck Count</Label>
                                <Input
                                  type="number"
                                  value={bookingDetails.duckCount}
                                  onChange={(e) => handleBookingDetailsChange("duckCount", e.target.value)}
                                  placeholder="Number of ducks"
                                />
                              </div>

                              {getSelectedService()?.areaSizes && (
                                <div className="space-y-2">
                                  <Label>Area Size</Label>
                                  <Select
                                    value={bookingDetails.areaSize}
                                    onValueChange={(value) => handleBookingDetailsChange("areaSize", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select area size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getSelectedService().areaSizes.map((size) => (
                                        <SelectItem key={size.id} value={size.id}>
                                          {size.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Additional Services */}
                      {getAdditionalServices().length > 0 && (
                        <div className="space-y-3 p-4 bg-background rounded-lg border">
                          <Label className="text-sm font-semibold">Additional Services (Optional)</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {getAdditionalServices().map((service) => (
                              <div key={service.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 border">
                                <Checkbox
                                  id={service.id}
                                  checked={bookingDetails.additionalServices?.includes(service.id)}
                                  onCheckedChange={() => toggleAdditionalService(service.id)}
                                />
                                <div className="flex-1">
                                  <label htmlFor={service.id} className="text-sm font-medium leading-none cursor-pointer">
                                    {service.name}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      +${service.price}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special Requirements */}
                      <div className="space-y-2">
                        <Label>Special Requirements</Label>
                        <Textarea
                          value={bookingDetails.specialRequirements}
                          onChange={(e) => handleBookingDetailsChange("specialRequirements", e.target.value)}
                          placeholder="Any special requirements or notes..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 💰 PRICING & PROMO CODE */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="w-5 h-5" />
                        Pricing & Promo Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* ✅ MANUAL PRICE TOGGLE */}
                      <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                        <Checkbox
                          id="manualPrice"
                          checked={isManualPrice}
                          onCheckedChange={(checked) => {
                            setIsManualPrice(checked);
                            if (!checked) {
                              // Allow auto-calc to take over
                            } else {
                              setManualPrice(pricing.totalPrice);
                            }
                          }}
                        />
                        <label
                          htmlFor="manualPrice"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Enable Manual Price Override
                        </label>
                      </div>

                      {isManualPrice && (
                        <div className="space-y-2">
                          <Label htmlFor="manualPriceInput">Manual Base Price ($)</Label>
                          <Input
                            id="manualPriceInput"
                            type="number"
                            value={manualPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setManualPrice(isNaN(val) ? 0 : val);
                            }}
                            placeholder="Enter manual price..."
                          />
                        </div>
                      )}

                      {/* PROMO CODE SELECTION */}
                      <div className="space-y-2">
                        <Label htmlFor="promoCode">Apply Promo Code (Optional)</Label>
                        <Select
                          value={selectedPromoCode?._id || ""}
                          onValueChange={applyPromoCode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select promo code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Promo Code</SelectItem>
                            {promoCodes.map((promo) => (
                              <SelectItem key={promo._id} value={promo._id}>
                                {promo.promoCode} - {promo.discountPercentage}% off
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* PROMO CODE APPLIED INDICATOR */}
                      {selectedPromoCode && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-700">
                            <Tag className="w-5 h-5" />
                            <div>
                              <p className="font-semibold">{selectedPromoCode.promoCode} Applied!</p>
                              <p className="text-sm">{pricing.discountPercent}% discount applied</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PRICE BREAKDOWN */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Subtotal</Label>
                          <div className="text-2xl font-bold">${pricing.totalPrice.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">Auto-calculated from packages & services</p>
                        </div>

                        {pricing.discountApplied && (
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Discount ({pricing.discountPercent}%)</Label>
                            <div className="text-2xl font-bold text-green-600">
                              -${(pricing.totalPrice - pricing.discountedPrice).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">Promo code savings</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Final Price</Label>
                          <div className="text-3xl font-bold text-primary">${pricing.discountedPrice.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">
                            {pricing.discountApplied ? 'After discount' : 'Total amount'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 📝 ADDITIONAL NOTES */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={4}
                        placeholder="Add any special instructions or notes..."
                      />
                    </CardContent>
                  </Card>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} size="lg">
                      Cancel
                    </Button>
                    <Button type="submit" size="lg" className="min-w-[150px] bg-blue-600 hover:bg-blue-700">
                      Create Booking
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBookingDialog;