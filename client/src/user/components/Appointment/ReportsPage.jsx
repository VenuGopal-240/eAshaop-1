import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from "@mui/material";
import { API_BASE_URL } from "../../../api-config";
import { toast } from "react-toastify";
import { postReport } from "../../../Util/apiRequest";

export default function ReportsPage({ open, setOpenReport, comment, setAnchorEl,role }) {

    const [text, setText] = useState("");

    const handleDialogClose = () => {
        setOpenReport(false);
    };
    const storedUser = JSON.parse(localStorage.getItem("user"));


    const handleReports = async () => {
        const payload = {
            "targetType": "review",
            "targetId": comment.id,
            "reporter": storedUser?.id,
            "reason": "Abusive language",
            "message": "Badtameez tone"
        };
        try {
            // const res = await fetch(`${API_BASE_URL}/api/reports`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload),
            // });
            // const data = await res.json();
            // if (!res.ok) throw new Error(data.message || 'Failed to post review');
            // console.log(data);
            const data = await postReport(payload);
            console.log(data);
            toast.success(data.message || 'Review posted');

        } catch (err) {
            toast.error(err.message || 'Failed to post review');
        }
        handleDialogClose();
        setAnchorEl(false);
    }
    return (
        <>
            <Dialog open={open} fullWidth maxWidth="sm">
                <DialogTitle>Report This Post</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={text}
                        placeholder="Write your report message..."
                        onChange={(e) => setText(e.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleReports}>
                        Submit Report
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
