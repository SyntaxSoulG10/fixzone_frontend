"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Container,
} from "@mui/material";
import { FiCheckCircle as CheckCircleOutlineIcon, FiXCircle as ErrorOutlineIcon } from "react-icons/fi";
import { verifyPaymentSuccess } from "@/lib/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId") || searchParams.get("session") || searchParams.get("payment_session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("success");
      setMessage("Your payment request has been received. If a confirmation is needed, it will appear in your booking history shortly.");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyPaymentSuccess(sessionId);
        setStatus("success");
        setMessage(result || "Your payment has been confirmed successfully.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Payment verification failed. Please contact support.");
      }
    };

    verify();
  }, [sessionId]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: "center",
            width: "100%",
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* ─── LOADING ─── */}
          {status === "loading" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              <CircularProgress
                size={56}
                thickness={4}
                sx={{ color: "#EA580C" }}
              />
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.secondary"
              >
                Verifying payment...
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Please wait while we confirm your transaction.
              </Typography>
            </Box>
          )}

          {/* ─── SUCCESS ─── */}
          {status === "success" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                }}
              >
                <CheckCircleOutlineIcon
                  size={44} color="#fff"
                />
              </Box>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: "#1E293B" }}
              >
                Payment Successful
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 360, mx: "auto", lineHeight: 1.6 }}
              >
                {message}
              </Typography>

              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ mt: 0.5 }}
              >
                A confirmation has been sent to your account.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/dashboard/customer/history")}
                sx={{
                  mt: 3,
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  background:
                    "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
                  boxShadow: "0 4px 14px rgba(234,88,12,0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #C2410C 0%, #9A3412 100%)",
                    boxShadow: "0 6px 20px rgba(234,88,12,0.4)",
                  },
                }}
              >
                Go to Dashboard
              </Button>
            </Box>
          )}

          {/* ─── ERROR ─── */}
          {status === "error" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  boxShadow: "0 8px 24px rgba(239,68,68,0.3)",
                }}
              >
                <ErrorOutlineIcon size={44} color="#fff" />
              </Box>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: "#1E293B" }}
              >
                Payment Verification Failed
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 360, mx: "auto", lineHeight: 1.6 }}
              >
                {message}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 3,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/dashboard")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    "&:hover": {
                      borderColor: "#cbd5e1",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => window.location.reload()}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
                    boxShadow: "0 4px 14px rgba(234,88,12,0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #C2410C 0%, #9A3412 100%)",
                    },
                  }}
                >
                  Retry
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={48} sx={{ color: "#EA580C" }} />
          </Box>
        </Container>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
