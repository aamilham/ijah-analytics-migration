<?php
include 'init.php'; // Pastikan $link terdefinisi sebagai koneksi PostgreSQL yang valid

header('Content-Type: application/json; charset=utf-8');

$respArr = [];

// Ambil input JSON
$postdata = file_get_contents("php://input");
error_log("predict.php received raw input: " . $postdata);

$requestList = json_decode($postdata, true);

if (empty($requestList)) {
    $respArr['error'] = 'No search parameters provided';
    echo json_encode($respArr);
    error_log("predict.php response: " . json_encode($respArr));
    exit;
}

// Extract ID dari request
$plantIds = array_map(fn($item) => $item['id'], $requestList['plants'] ?? []);
$compoundIds = array_map(fn($item) => $item['id'], $requestList['compounds'] ?? []);
$proteinIds = array_map(fn($item) => $item['id'], $requestList['proteins'] ?? []);
$diseaseIds = array_map(fn($item) => $item['id'], $requestList['diseases'] ?? []);

// Fungsi untuk mengambil semua baris sebagai associative array
function pg_fetch_all_assoc_custom($result) {
    $rows = [];
    while ($row = pg_fetch_assoc($result)) {
        // Normalisasi nama kunci menjadi huruf kecil
        $normalized_row = array_change_key_case($row, CASE_LOWER);
        $rows[] = $normalized_row;
    }
    return $rows;
}

// Fungsi untuk membangun string array PostgreSQL dengan meng-escape setiap elemen
function build_pg_array(array $arr, $link): string {
    // Escape setiap elemen menggunakan koneksi PostgreSQL dan tambahkan tanda kutip ganda
    $escaped = array_map(function($item) use ($link) {
        return '"' . pg_escape_string($link, $item) . '"';
    }, $arr);
    // Gabungkan dengan koma dan bungkus dalam kurung kurawal
    return '{' . implode(',', $escaped) . '}';
}

// Initialize arrays to store results
$plantCompoundData = array();
$compoundProteinData = array();
$proteinDiseaseData = array();

// Get plant vs compound relationships
if (!empty($plantIds)) {
    $sql = "SELECT DISTINCT pc.pla_id, p.pla_name, p.pla_idr_name, pc.com_id, c.com_cas_id 
            FROM plant_vs_compound pc
            JOIN plant p ON pc.pla_id = p.pla_id
            JOIN compound c ON pc.com_id = c.com_id
            WHERE pc.pla_id = ANY($1::text[])";
    $pg_array = build_pg_array($plantIds, $link);
    error_log("Executing Plant vs Compound Query: " . $sql . " with params: " . $pg_array);
    $result = pg_query_params($link, $sql, array($pg_array));
    if (!$result) {
        $respArr['error'] = 'Plant vs Compound query failed: ' . pg_last_error($link);
        echo json_encode($respArr);
        error_log("predict.php response: " . json_encode($respArr));
        exit;
    }
    $plantCompoundData = pg_fetch_all_assoc_custom($result);
} else if (!empty($compoundIds)) {
    $sql = "SELECT DISTINCT pc.pla_id, p.pla_name, p.pla_idr_name, pc.com_id, c.com_cas_id 
            FROM plant_vs_compound pc
            JOIN plant p ON pc.pla_id = p.pla_id
            JOIN compound c ON pc.com_id = c.com_id
            WHERE pc.com_id = ANY($1::text[])";
    $pg_array = build_pg_array($compoundIds, $link);
    error_log("Executing Compound vs Plant Query: " . $sql . " with params: " . $pg_array);
    $result = pg_query_params($link, $sql, array($pg_array));
    if (!$result) {
        $respArr['error'] = 'Compound vs Plant query failed: ' . pg_last_error($link);
        echo json_encode($respArr);
        error_log("predict.php response: " . json_encode($respArr));
        exit;
    }
    $plantCompoundData = pg_fetch_all_assoc_custom($result);
}

// Get compound IDs from plant-compound relationships if plants were input
$relatedCompoundIds = array();
if (!empty($plantCompoundData)) {
    foreach ($plantCompoundData as $data) {
        if (isset($data['com_id'])) {
            $relatedCompoundIds[] = $data['com_id'];
        }
    }
    $relatedCompoundIds = array_unique($relatedCompoundIds);
    error_log("Related Compound IDs: " . implode(',', $relatedCompoundIds));
}

// Untuk debugging: Coba dengan satu com_id yang diketahui memiliki data
// Uncomment baris berikut jika Anda ingin mencoba dengan satu com_id
// $relatedCompoundIds = ['COM00006749']; // Gantilah dengan com_id yang benar-benar memiliki data
// error_log("Testing with single Compound ID: " . implode(',', $relatedCompoundIds));

// Debug: Check if compound_vs_protein table has any data
$debugTotalQuery = "SELECT COUNT(*) as total FROM compound_vs_protein";
$debugTotalResult = pg_query($link, $debugTotalQuery);
if ($debugTotalResult) {
    $totalCount = pg_fetch_assoc($debugTotalResult);
    error_log("Debug: Total compound-protein relationships in database: " . $totalCount['total']);
    
    // Get a sample of any relationships
    $sampleAnyQuery = "SELECT com_id, pro_id, source, weight FROM compound_vs_protein LIMIT 5";
    $sampleAnyResult = pg_query($link, $sampleAnyQuery);
    if ($sampleAnyResult) {
        $anySamples = pg_fetch_all($sampleAnyResult);
        error_log("Debug: Sample of any relationships: " . json_encode($anySamples));
    }
}

// Get compound vs protein relationships
if (!empty($compoundIds) || !empty($proteinIds)) {
    $compoundProteinQuery = "SELECT DISTINCT cp.com_id, c.com_cas_id, cp.pro_id, p.pro_name, 
            p.pro_uniprot_id, p.pro_pdb_id, cp.source, cp.weight
            FROM compound_vs_protein cp
            JOIN compound c ON cp.com_id = c.com_id
            JOIN protein p ON cp.pro_id = p.pro_id
            WHERE ";
    
    $conditions = array();
    $params = array();
    $paramCount = 1;
    
    if (!empty($compoundIds)) {
        $conditions[] = "cp.com_id = ANY($" . $paramCount . "::text[])";
        $params[] = '{' . implode(',', $compoundIds) . '}';
        $paramCount++;
    }
    
    if (!empty($proteinIds)) {
        $conditions[] = "cp.pro_id = ANY($" . $paramCount . "::text[])";
        $params[] = '{' . implode(',', $proteinIds) . '}';
        $paramCount++;
    }
    
    $compoundProteinQuery .= implode(' OR ', $conditions);
    error_log("Executing Compound vs Protein Query: " . $compoundProteinQuery . " with params: " . implode(',', $params));
    
    $compoundProteinResult = pg_query_params($link, $compoundProteinQuery, $params);
    if ($compoundProteinResult) {
        $compoundProteinData = pg_fetch_all($compoundProteinResult);
        if (!empty($compoundProteinData)) {
            // Extract compound IDs for next query if we started with proteins
            if (empty($compoundIds) && !empty($proteinIds)) {
                $compoundIds = array_unique(array_column($compoundProteinData, 'com_id'));
            }
            // Extract protein IDs for next query if we started with compounds
            if (!empty($compoundIds) && empty($proteinIds)) {
                $proteinIds = array_unique(array_column($compoundProteinData, 'pro_id'));
            }
        }
    } else {
        error_log("Error in compound vs protein query: " . pg_last_error($link));
    }
}

// Get protein vs disease relationships
if (!empty($proteinIds) || !empty($diseaseIds)) {
    $proteinDiseaseQuery = "SELECT DISTINCT pd.pro_id, p.pro_name, p.pro_uniprot_id, 
            p.pro_pdb_id, pd.dis_id, d.dis_name, d.dis_omim_id, pd.source, pd.weight
            FROM protein_vs_disease pd
            JOIN protein p ON pd.pro_id = p.pro_id
            JOIN disease d ON pd.dis_id = d.dis_id
            WHERE ";
    
    $conditions = array();
    $params = array();
    $paramCount = 1;
    
    if (!empty($proteinIds)) {
        $conditions[] = "pd.pro_id = ANY($" . $paramCount . "::text[])";
        $params[] = '{' . implode(',', $proteinIds) . '}';
        $paramCount++;
    }
    
    if (!empty($diseaseIds)) {
        $conditions[] = "pd.dis_id = ANY($" . $paramCount . "::text[])";
        $params[] = '{' . implode(',', $diseaseIds) . '}';
        $paramCount++;
    }
    
    $proteinDiseaseQuery .= implode(' OR ', $conditions);
    error_log("Executing Protein vs Disease Query: " . $proteinDiseaseQuery . " with params: " . implode(',', $params));
    
    $proteinDiseaseResult = pg_query_params($link, $proteinDiseaseQuery, $params);
    if ($proteinDiseaseResult) {
        $proteinDiseaseData = pg_fetch_all($proteinDiseaseResult);
        if (!empty($proteinDiseaseData)) {
            // Extract protein IDs for previous query if we started with diseases
            if (empty($proteinIds) && !empty($diseaseIds)) {
                $proteinIds = array_unique(array_column($proteinDiseaseData, 'pro_id'));
            }
            // Extract disease IDs for next query if we started with proteins
            if (!empty($proteinIds) && empty($diseaseIds)) {
                $diseaseIds = array_unique(array_column($proteinDiseaseData, 'dis_id'));
            }
        }
    } else {
        error_log("Error in protein vs disease query: " . pg_last_error($link));
    }
}

// If we found new relationships, re-run previous queries
if ((!empty($proteinIds) && empty($compoundProteinData)) || 
    (!empty($diseaseIds) && empty($proteinDiseaseData))) {
    // Recursively call the relationship discovery
    // But first prevent infinite recursion
    static $recursionCount = 0;
    if ($recursionCount < 2) {
        $recursionCount++;
        // Re-run compound-protein query with new protein IDs
        if (!empty($proteinIds) && empty($compoundProteinData)) {
            // Code from compound-protein query section
            $compoundProteinQuery = "SELECT DISTINCT cp.com_id, c.com_cas_id, cp.pro_id, 
                    p.pro_name, p.pro_uniprot_id, p.pro_pdb_id, cp.source, cp.weight
                    FROM compound_vs_protein cp
                    JOIN compound c ON cp.com_id = c.com_id
                    JOIN protein p ON cp.pro_id = p.pro_id
                    WHERE cp.pro_id = ANY($1::text[])";
            $params = array('{' . implode(',', $proteinIds) . '}');
            $compoundProteinResult = pg_query_params($link, $compoundProteinQuery, $params);
            if ($compoundProteinResult) {
                $compoundProteinData = pg_fetch_all($compoundProteinResult);
            }
        }
        
        // Re-run protein-disease query with new disease IDs
        if (!empty($diseaseIds) && empty($proteinDiseaseData)) {
            // Code from protein-disease query section
            $proteinDiseaseQuery = "SELECT DISTINCT pd.pro_id, p.pro_name, p.pro_uniprot_id,
                    p.pro_pdb_id, pd.dis_id, d.dis_name, d.dis_omim_id, pd.source, pd.weight
                    FROM protein_vs_disease pd
                    JOIN protein p ON pd.pro_id = p.pro_id
                    JOIN disease d ON pd.dis_id = d.dis_id
                    WHERE pd.dis_id = ANY($1::text[])";
            $params = array('{' . implode(',', $diseaseIds) . '}');
            $proteinDiseaseResult = pg_query_params($link, $proteinDiseaseQuery, $params);
            if ($proteinDiseaseResult) {
                $proteinDiseaseData = pg_fetch_all($proteinDiseaseResult);
            }
        }
    }
}

// Process results and prepare response
if (empty($plantCompoundData) && empty($compoundProteinData) && empty($proteinDiseaseData)) {
    $respArr['message'] = 'No results found';
} else {
    // Calculate counts based on relationships
    $counts = array();

    // Count plants from input or relationships
    $counts['plants'] = !empty($plantIds) ? count($plantIds) : 
        (!empty($plantCompoundData) ? count(array_unique(array_column($plantCompoundData, 'pla_id'))) : 0);

    // Count compounds from relationships
    $uniqueCompounds = array();
    if (!empty($plantCompoundData)) {
        foreach ($plantCompoundData as $data) {
            if (isset($data['com_id'])) {
                $uniqueCompounds[$data['com_id']] = true;
            }
        }
    }
    if (!empty($compoundProteinData)) {
        foreach ($compoundProteinData as $data) {
            if (isset($data['com_id'])) {
                $uniqueCompounds[$data['com_id']] = true;
            }
        }
    }
    $counts['compounds'] = count($uniqueCompounds);

    // Count unique proteins from relationships
    $uniqueProteins = array();
    if (!empty($compoundProteinData)) {
        foreach ($compoundProteinData as $data) {
            if (isset($data['pro_id'])) {
                $uniqueProteins[$data['pro_id']] = true;
            }
        }
    }
    if (!empty($proteinDiseaseData)) {
        foreach ($proteinDiseaseData as $data) {
            if (isset($data['pro_id'])) {
                $uniqueProteins[$data['pro_id']] = true;
            }
        }
    }
    $counts['proteins'] = count($uniqueProteins);

    // Count unique diseases from relationships
    $uniqueDiseases = array();
    if (!empty($proteinDiseaseData)) {
        foreach ($proteinDiseaseData as $data) {
            if (isset($data['dis_id'])) {
                $uniqueDiseases[$data['dis_id']] = true;
            }
        }
    }
    $counts['diseases'] = count($uniqueDiseases);

    // Add relationships to response
    if (!empty($plantCompoundData)) {
        $respArr['plant_vs_compound'] = array_values($plantCompoundData);
    }
    
    // Format compound-protein relationships with source and weight
    if (!empty($compoundProteinData)) {
        $formattedCompoundProtein = array();
        foreach ($compoundProteinData as $data) {
            $formattedCompoundProtein[] = array(
                'com_id' => $data['com_id'],
                'com_cas_id' => $data['com_cas_id'],
                'pro_id' => $data['pro_id'],
                'pro_name' => $data['pro_name'],
                'pro_uniprot_id' => $data['pro_uniprot_id'],
                'pro_pdb_id' => $data['pro_pdb_id'],
                'source' => $data['source'],
                'weight' => floatval($data['weight'])
            );
        }
        $respArr['compound_vs_protein'] = $formattedCompoundProtein;
    }
    
    // Format protein-disease relationships with source and weight 
    if (!empty($proteinDiseaseData)) {
        $formattedProteinDisease = array();
        foreach ($proteinDiseaseData as $data) {
            $formattedProteinDisease[] = array(
                'pro_id' => $data['pro_id'],
                'pro_name' => $data['pro_name'],
                'pro_uniprot_id' => $data['pro_uniprot_id'],
                'pro_pdb_id' => $data['pro_pdb_id'],
                'dis_id' => $data['dis_id'],
                'dis_name' => $data['dis_name'], 
                'dis_omim_id' => $data['dis_omim_id'],
                'source' => $data['source'],
                'weight' => floatval($data['weight'])
            );
        }
        $respArr['protein_vs_disease'] = $formattedProteinDisease;
    }

    $respArr['counts'] = $counts;
}

// Add logging for final response
error_log("Counts: " . json_encode($counts));
error_log("Compound vs Protein Data to send: " . json_encode(isset($respArr['compound_vs_protein']) ? $respArr['compound_vs_protein'] : []));
error_log("Protein vs Disease Data to send: " . json_encode(isset($respArr['protein_vs_disease']) ? $respArr['protein_vs_disease'] : []));

echo json_encode($respArr);
error_log("predict.php response: " . json_encode($respArr));
exit;
?>
