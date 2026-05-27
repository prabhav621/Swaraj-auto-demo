import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import stringSimilarity from 'string-similarity';

// Define types
interface Application {
    id: string | number;
    name: string;
    father_name: string;
    tehsil: string;
    income: number;
    land_holding_ha: number;
}

interface MasterRecord {
    id: string;
    name: string;
    father_name: string;
    tehsil: string;
    income: string;
    land_holding_ha: string;
    category: string;
    expected_status: string;
}

// Load data once in memory
let cachedData: MasterRecord[] | null = null;

function getMasterData(): MasterRecord[] {
    if (cachedData) return cachedData;
    try {
        const csvPath = path.join(process.cwd(), '..', 'backend', 'government_master_data.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.trim().split('\n');
        const headers = lines[0].split(',');
        
        const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const record: any = {};
            headers.forEach((header, index) => {
                record[header.trim()] = values[index]?.trim();
            });
            return record as MasterRecord;
        });
        cachedData = data;
        return data;
    } catch (error) {
        console.error("Error reading master data:", error);
        return [];
    }
}

export async function POST(request: Request) {
    try {
        const applications: Application[] = await request.json();
        const df = getMasterData();
        
        const results = applications.map(app => {
            // Check eligibility first
            let reason = null;
            if (app.income >= 200000) {
                reason = `Income of ${app.income} exceeds BPL limit (2L).`;
            } else if (app.land_holding_ha >= 2.0) {
                reason = `Land holding of ${app.land_holding_ha} Ha exceeds limit (2 Ha).`;
            }

            if (reason) {
                return {
                    id: app.id,
                    name: app.name,
                    tehsil: app.tehsil,
                    status: "STATUS_REJECTED",
                    reason: reason,
                    match_score: undefined
                };
            }

            // Eligible by criteria, now do fuzzy matching against government_master_data
            const tehsil_df = df.filter(row => row.tehsil === app.tehsil);
            
            let best_score = 0.0;
            
            for (const row of tehsil_df) {
                const name_score = stringSimilarity.compareTwoStrings(String(app.name).toLowerCase(), String(row.name).toLowerCase());
                const fname_score = stringSimilarity.compareTwoStrings(String(app.father_name).toLowerCase(), String(row.father_name).toLowerCase());
                
                // Weighted score: Name is more important
                const avg_score = (name_score * 0.7 + fname_score * 0.3);
                if (avg_score > best_score) {
                    best_score = avg_score;
                }
            }
            
            if (best_score >= 0.95) {
                return {
                    id: app.id,
                    name: app.name,
                    tehsil: app.tehsil,
                    status: "STATUS_AUTO_APPROVE",
                    reason: "Match >= 0.95 and Eligibility criteria met.",
                    match_score: best_score
                };
            } else if (best_score >= 0.80) {
                return {
                    id: app.id,
                    name: app.name,
                    tehsil: app.tehsil,
                    status: "STATUS_FIELD_VERIFICATION",
                    reason: "Needs field verification (Fuzzy match between 80% and 95%).",
                    match_score: best_score
                };
            } else {
                return {
                    id: app.id,
                    name: app.name,
                    tehsil: app.tehsil,
                    status: "STATUS_REJECTED",
                    reason: `Failed identity check (Max Match Score = ${best_score.toFixed(2)}).`,
                    match_score: best_score
                };
            }
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Batch processing error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
