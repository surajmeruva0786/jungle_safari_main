import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

interface LogEntry {
    // Metadata
    date_or_day?: string;
    incharge_signature?: string;

    // SECTION A: DAILY ANIMAL HEALTH
    feed_consumption_percentage?: string;
    feed_quantity_consumed?: string;
    water_consumption_normal?: boolean;
    digestion_problem?: boolean;
    digestion_problem_details?: string;

    injury_or_illness_noticed?: boolean;
    animal_weak_or_lethargic?: boolean;
    health_problem_details?: string;

    activity_level?: string;
    alert_and_responsive?: boolean;

    reproductive_signs_observed?: boolean;
    reproductive_signs_description?: string;

    critical_condition_observed?: boolean;
    critical_condition_details?: string;

    pests_noticed?: boolean;
    safety_risks_noticed?: boolean;
    safety_risk_details?: string;

    additional_observations?: string;

    // ENCLOSURE REPORT
    enclosure_cleaning_time?: string;
    waste_removed_properly?: boolean;
    waste_removal_issue?: string;

    water_trough_cleaned?: boolean;
    fresh_water_available?: boolean;

    fencing_secure_and_functioning?: boolean;
    fencing_issue_details?: string;

    moat_condition?: string;
    enclosure_pests_noticed?: boolean;
    staff_attendance_complete?: boolean;
    all_secured_before_closing?: boolean;
    enclosure_remarks?: string;

    // Legacy fields for observation text
    fullObservationText?: string;
    transcribedText?: string;
    observationText?: string;
}

interface LogDetailsSectionsProps {
    log: LogEntry;
    language: 'en' | 'hi';
}

const BooleanIndicator = ({ value, label }: { value: boolean; label: string }) => (
    <div className="flex items-center gap-2">
        {value ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
            <XCircle className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
);

const FieldRow = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200">{value}</span>
        </div>
    );
};

export function LogDetailsSections({ log, language }: LogDetailsSectionsProps) {
    const [animalHealthOpen, setAnimalHealthOpen] = useState(true);
    const [enclosureReportOpen, setEnclosureReportOpen] = useState(false);

    const t = {
        en: {
            animalHealth: 'Section A: Daily Animal Health',
            enclosureReport: 'Enclosure Report',
            feeding: '1. Feeding & Drinking',
            feedConsumed: 'Feed Consumed',
            quantity: 'Quantity',
            waterNormal: 'Water consumption normal',
            digestionProblem: 'Digestion problem',
            details: 'Details',
            health: '2. Health & Physical Condition',
            injuryNoticed: 'Injury/illness noticed',
            weakLethargic: 'Weak/lethargic',
            behaviour: '3. Behaviour & Activity',
            activityLevel: 'Activity Level',
            alertResponsive: 'Alert and responsive',
            reproductive: '4. Reproductive Status',
            reproSigns: 'Reproductive signs observed',
            description: 'Description',
            critical: '5. Mortality / Critical Condition',
            criticalObserved: 'Critical condition observed',
            hygiene: '6. Hygiene, Pest & Safety',
            pestsNoticed: 'Pests noticed',
            safetyRisks: 'Safety risks noticed',
            additional: '7. Additional Observations',
            cleanliness: '1. Cleanliness & Waste',
            cleaningTime: 'Cleaning Time',
            wasteRemoved: 'Waste removed properly',
            issue: 'Issue',
            water: '2. Water & Sanitation',
            troughCleaned: 'Water trough cleaned',
            freshWater: 'Fresh water available',
            fencing: '3. Fencing & Locking',
            fencingSecure: 'All secure and functioning',
            moat: '4. Moat Condition',
            moatStatus: 'Moat Status',
            pest: '5. Pest Control',
            enclosurePests: 'Pests in enclosure',
            staff: '6. Staff Status',
            attendance: 'Attendance complete',
            safety: '7. Final Safety',
            allSecured: 'All secured before closing',
            remarks: '8. Remarks',
            observation: 'Raw Observation',
            signature: 'In-charge Signature',
            date: 'Date',
        },
        hi: {
            animalHealth: 'खंड A: दैनिक पशु स्वास्थ्य',
            enclosureReport: 'बाड़ा रिपोर्ट',
            feeding: '1. भोजन और पानी',
            feedConsumed: 'भोजन खाया',
            quantity: 'मात्रा',
            waterNormal: 'पानी सामान्य',
            digestionProblem: 'पाचन समस्या',
            details: 'विवरण',
            health: '2. स्वास्थ्य और शारीरिक स्थिति',
            injuryNoticed: 'चोट/बीमारी देखी गई',
            weakLethargic: 'कमजोर/सुस्त',
            behaviour: '3. व्यवहार और गतिविधि',
            activityLevel: 'गतिविधि स्तर',
            alertResponsive: 'सतर्क और उत्तरदायी',
            reproductive: '4. प्रजनन स्थिति',
            reproSigns: 'प्रजनन संकेत देखे गए',
            description: 'विवरण',
            critical: '5. मृत्यु / गंभीर स्थिति',
            criticalObserved: 'गंभीर स्थिति देखी गई',
            hygiene: '6. स्वच्छता, कीट और सुरक्षा',
            pestsNoticed: 'कीट देखे गए',
            safetyRisks: 'सुरक्षा जोखिम देखे गए',
            additional: '7. अतिरिक्त अवलोकन',
            cleanliness: '1. सफाई और कचरा',
            cleaningTime: 'सफाई का समय',
            wasteRemoved: 'कचरा हटाया गया',
            issue: 'समस्या',
            water: '2. पानी और स्वच्छता',
            troughCleaned: 'पानी का गर्त साफ किया',
            freshWater: 'ताजा पानी उपलब्ध',
            fencing: '3. बाड़ और ताला',
            fencingSecure: 'सब सुरक्षित और कार्यशील',
            moat: '4. खाई की स्थिति',
            moatStatus: 'खाई की स्थिति',
            pest: '5. कीट नियंत्रण',
            enclosurePests: 'बाड़े में कीट',
            staff: '6. कर्मचारी स्थिति',
            attendance: 'उपस्थिति पूर्ण',
            safety: '7. अंतिम सुरक्षा',
            allSecured: 'सब सुरक्षित',
            remarks: '8. टिप्पणियाँ',
            observation: 'कच्चा अवलोकन',
            signature: 'प्रभारी हस्ताक्षर',
            date: 'तिथि',
        },
    };

    const labels = t[language];

    return (
        <div className="space-y-3">
            {/* Raw Observation Text */}
            {(log.fullObservationText || log.transcribedText || log.observationText) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        {labels.observation}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {log.fullObservationText || log.transcribedText || log.observationText}
                    </p>
                </div>
            )}

            {/* Metadata */}
            {(log.date_or_day || log.incharge_signature) && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FieldRow label={labels.date} value={log.date_or_day} />
                    <FieldRow label={labels.signature} value={log.incharge_signature} />
                </div>
            )}

            {/* SECTION A: ANIMAL HEALTH */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                    onClick={() => setAnimalHealthOpen(!animalHealthOpen)}
                    className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                    <span className="font-semibold text-green-800 dark:text-green-200">
                        {labels.animalHealth}
                    </span>
                    {animalHealthOpen ? (
                        <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                </button>

                {animalHealthOpen && (
                    <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
                        {/* 1. Feeding & Drinking */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.feeding}</h4>
                            <div className="grid grid-cols-2 gap-3 pl-3">
                                <FieldRow label={labels.feedConsumed} value={log.feed_consumption_percentage} />
                                <FieldRow label={labels.quantity} value={log.feed_quantity_consumed} />
                            </div>
                            <div className="pl-3 space-y-1">
                                {typeof log.water_consumption_normal === 'boolean' && (
                                    <BooleanIndicator value={log.water_consumption_normal} label={labels.waterNormal} />
                                )}
                                {typeof log.digestion_problem === 'boolean' && (
                                    <BooleanIndicator value={!log.digestion_problem} label={`No ${labels.digestionProblem.toLowerCase()}`} />
                                )}
                                {log.digestion_problem_details && (
                                    <FieldRow label={labels.details} value={log.digestion_problem_details} />
                                )}
                            </div>
                        </div>

                        {/* 2. Health & Physical Condition */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.health}</h4>
                            <div className="pl-3 space-y-1">
                                {typeof log.injury_or_illness_noticed === 'boolean' && (
                                    <BooleanIndicator value={!log.injury_or_illness_noticed} label={`No ${labels.injuryNoticed.toLowerCase()}`} />
                                )}
                                {typeof log.animal_weak_or_lethargic === 'boolean' && (
                                    <BooleanIndicator value={!log.animal_weak_or_lethargic} label={`Not ${labels.weakLethargic.toLowerCase()}`} />
                                )}
                                {log.health_problem_details && (
                                    <FieldRow label={labels.details} value={log.health_problem_details} />
                                )}
                            </div>
                        </div>

                        {/* 3. Behaviour & Activity */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.behaviour}</h4>
                            <div className="pl-3 space-y-1">
                                <FieldRow label={labels.activityLevel} value={log.activity_level} />
                                {typeof log.alert_and_responsive === 'boolean' && (
                                    <BooleanIndicator value={log.alert_and_responsive} label={labels.alertResponsive} />
                                )}
                            </div>
                        </div>

                        {/* 4. Reproductive Status */}
                        {(log.reproductive_signs_observed || log.reproductive_signs_description) && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.reproductive}</h4>
                                <div className="pl-3 space-y-1">
                                    {typeof log.reproductive_signs_observed === 'boolean' && (
                                        <BooleanIndicator value={log.reproductive_signs_observed} label={labels.reproSigns} />
                                    )}
                                    {log.reproductive_signs_description && (
                                        <FieldRow label={labels.description} value={log.reproductive_signs_description} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 5. Critical Condition */}
                        {(log.critical_condition_observed || log.critical_condition_details) && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.critical}</h4>
                                <div className="pl-3 space-y-1">
                                    {typeof log.critical_condition_observed === 'boolean' && (
                                        <BooleanIndicator value={!log.critical_condition_observed} label={`No ${labels.criticalObserved.toLowerCase()}`} />
                                    )}
                                    {log.critical_condition_details && (
                                        <FieldRow label={labels.details} value={log.critical_condition_details} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 6. Hygiene & Safety */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.hygiene}</h4>
                            <div className="pl-3 space-y-1">
                                {typeof log.pests_noticed === 'boolean' && (
                                    <BooleanIndicator value={!log.pests_noticed} label={`No ${labels.pestsNoticed.toLowerCase()}`} />
                                )}
                                {typeof log.safety_risks_noticed === 'boolean' && (
                                    <BooleanIndicator value={!log.safety_risks_noticed} label={`No ${labels.safetyRisks.toLowerCase()}`} />
                                )}
                                {log.safety_risk_details && (
                                    <FieldRow label={labels.details} value={log.safety_risk_details} />
                                )}
                            </div>
                        </div>

                        {/* 7. Additional Observations */}
                        {log.additional_observations && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.additional}</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 pl-3">{log.additional_observations}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ENCLOSURE REPORT */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                    onClick={() => setEnclosureReportOpen(!enclosureReportOpen)}
                    className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                    <span className="font-semibold text-amber-800 dark:text-amber-200">
                        {labels.enclosureReport}
                    </span>
                    {enclosureReportOpen ? (
                        <ChevronDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                </button>

                {enclosureReportOpen && (
                    <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
                        {/* 1. Cleanliness */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.cleanliness}</h4>
                            <div className="pl-3 space-y-1">
                                <FieldRow label={labels.cleaningTime} value={log.enclosure_cleaning_time} />
                                {typeof log.waste_removed_properly === 'boolean' && (
                                    <BooleanIndicator value={log.waste_removed_properly} label={labels.wasteRemoved} />
                                )}
                                {log.waste_removal_issue && (
                                    <FieldRow label={labels.issue} value={log.waste_removal_issue} />
                                )}
                            </div>
                        </div>

                        {/* 2. Water & Sanitation */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.water}</h4>
                            <div className="pl-3 space-y-1">
                                {typeof log.water_trough_cleaned === 'boolean' && (
                                    <BooleanIndicator value={log.water_trough_cleaned} label={labels.troughCleaned} />
                                )}
                                {typeof log.fresh_water_available === 'boolean' && (
                                    <BooleanIndicator value={log.fresh_water_available} label={labels.freshWater} />
                                )}
                            </div>
                        </div>

                        {/* 3. Fencing */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.fencing}</h4>
                            <div className="pl-3 space-y-1">
                                {typeof log.fencing_secure_and_functioning === 'boolean' && (
                                    <BooleanIndicator value={log.fencing_secure_and_functioning} label={labels.fencingSecure} />
                                )}
                                {log.fencing_issue_details && (
                                    <FieldRow label={labels.issue} value={log.fencing_issue_details} />
                                )}
                            </div>
                        </div>

                        {/* 4. Moat */}
                        {log.moat_condition && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.moat}</h4>
                                <div className="pl-3">
                                    <FieldRow label={labels.moatStatus} value={log.moat_condition} />
                                </div>
                            </div>
                        )}

                        {/* 5. Pest Control */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.pest}</h4>
                            <div className="pl-3">
                                {typeof log.enclosure_pests_noticed === 'boolean' && (
                                    <BooleanIndicator value={!log.enclosure_pests_noticed} label={`No ${labels.enclosurePests.toLowerCase()}`} />
                                )}
                            </div>
                        </div>

                        {/* 6. Staff */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.staff}</h4>
                            <div className="pl-3">
                                {typeof log.staff_attendance_complete === 'boolean' && (
                                    <BooleanIndicator value={log.staff_attendance_complete} label={labels.attendance} />
                                )}
                            </div>
                        </div>

                        {/* 7. Final Safety */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.safety}</h4>
                            <div className="pl-3">
                                {typeof log.all_secured_before_closing === 'boolean' && (
                                    <BooleanIndicator value={log.all_secured_before_closing} label={labels.allSecured} />
                                )}
                            </div>
                        </div>

                        {/* 8. Remarks */}
                        {log.enclosure_remarks && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{labels.remarks}</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 pl-3">{log.enclosure_remarks}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
