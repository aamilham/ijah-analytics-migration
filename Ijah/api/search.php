<?php
header('Content-Type: application/json');

$host = "localhost";
$dbname = "ijahdatabase";
$user = "postgres";
$password = "Freedom255";

$connStr = "host=$host dbname=$dbname user=$user password=$password";
$conn = pg_connect($connStr);
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . pg_last_error()]);
    exit;
}

$postdata = file_get_contents("php://input");
$request = json_decode($postdata, true);

$selectedPlants = $request['plants'] ?? [];
$selectedCompounds = $request['compounds'] ?? [];
$selectedProteins = $request['proteins'] ?? [];
$selectedDiseases = $request['diseases'] ?? [];
$user_msg = $request['user_msg'] ?? '';

$plantFilter = "";
if (!empty($selectedPlants)) {
    $in = implode(",", array_map(fn($item) => "'" . pg_escape_string($item) . "'", $selectedPlants));
    $plantFilter = "WHERE latin_name IN ($in)";
}

$compoundFilter = "";
if (!empty($selectedCompounds)) {
    $in = implode(",", array_map(fn($item) => "'" . pg_escape_string($item) . "'", $selectedCompounds));
    $compoundFilter = "WHERE cas_id IN ($in)";
}

$proteinFilter = "";
if (!empty($selectedProteins)) {
    $in = implode(",", array_map(fn($item) => "'" . pg_escape_string($item) . "'", $selectedProteins));
    $proteinFilter = "WHERE uniprot_id IN ($in)";
}

$diseaseFilter = "";
if (!empty($selectedDiseases)) {
    $in = implode(",", array_map(fn($item) => "'" . pg_escape_string($item) . "'", $selectedDiseases));
    $diseaseFilter = "WHERE omim_id IN ($in)";
}

$plants = [];
$res = pg_query($conn, "SELECT latin_name, local_name FROM plant $plantFilter");
while($row = pg_fetch_assoc($res)) {
    $plants[] = $row;
}

$compounds = [];
$res = pg_query($conn, "SELECT cas_id, common_name, iupac_name FROM compound $compoundFilter");
while($row = pg_fetch_assoc($res)) {
    $compounds[] = $row;
}

$proteins = [];
$res = pg_query($conn, "SELECT uniprot_id, uniprot_protein_name, pdb_ids FROM protein $proteinFilter");
while($row = pg_fetch_assoc($res)) {
    $proteins[] = $row;
}

$diseases = [];
$res = pg_query($conn, "SELECT omim_id, disease_name FROM disease $diseaseFilter");
while($row = pg_fetch_assoc($res)) {
    $diseases[] = $row;
}

$plantCompoundLinks = [];
$res = pg_query($conn, "SELECT p.latin_name AS plant, c.cas_id AS compound, pc.confidence_score
    FROM plant_vs_compound pc
    JOIN plant p ON p.latin_name = pc.plant_latin_name
    JOIN compound c ON c.cas_id = pc.compound_cas_id");
while($row = pg_fetch_assoc($res)) {
    $plantCompoundLinks[] = $row;
}

$compoundProteinLinks = [];
$res = pg_query($conn, "SELECT c.cas_id AS compound, pr.uniprot_id AS protein, cp.confidence_score
    FROM compound_vs_protein cp
    JOIN compound c ON c.cas_id = cp.compound_cas_id
    JOIN protein pr ON pr.uniprot_id = cp.protein_uniprot_id");
while($row = pg_fetch_assoc($res)) {
    $compoundProteinLinks[] = $row;
}

$proteinDiseaseLinks = [];
$res = pg_query($conn, "SELECT pr.uniprot_id AS protein, d.omim_id AS disease, pd.confidence_score
    FROM protein_vs_disease pd
    JOIN protein pr ON pr.uniprot_id = pd.protein_uniprot_id
    JOIN disease d ON d.omim_id = pd.disease_omim_id");
while($row = pg_fetch_assoc($res)) {
    $proteinDiseaseLinks[] = $row;
}

$nodes = [];
$nodeIndex = [];

function addNode(&$nodes, &$nodeIndex, $name) {
    if (!array_key_exists($name, $nodeIndex)) {
        $nodeIndex[$name] = count($nodes);
        $nodes[] = ['name' => $name];
    }
}

foreach($plants as $p) {
    addNode($nodes, $nodeIndex, $p['latin_name']);
}
foreach($compounds as $c) {
    addNode($nodes, $nodeIndex, $c['cas_id']);
}
foreach($proteins as $pr) {
    addNode($nodes, $nodeIndex, $pr['uniprot_id']);
}
foreach($diseases as $d) {
    addNode($nodes, $nodeIndex, $d['omim_id']);
}

$sankeyData = [];
foreach($plantCompoundLinks as $link) {
    if (isset($nodeIndex[$link['plant']]) && isset($nodeIndex[$link['compound']])) {
        $sankeyData[] = [
            'from' => $link['plant'],
            'to' => $link['compound'],
            'weight' => floatval($link['confidence_score'])
        ];
    }
}

foreach($compoundProteinLinks as $link) {
    if (isset($nodeIndex[$link['compound']]) && isset($nodeIndex[$link['protein']])) {
        $sankeyData[] = [
            'from' => $link['compound'],
            'to' => $link['protein'],
            'weight' => floatval($link['confidence_score'])
        ];
    }
}

foreach($proteinDiseaseLinks as $link) {
    if (isset($nodeIndex[$link['protein']]) && isset($nodeIndex[$link['disease']])) {
        $sankeyData[] = [
            'from' => $link['protein'],
            'to' => $link['disease'],
            'weight' => floatval($link['confidence_score'])
        ];
    }
}

$response = [
    'user_msg' => $user_msg,
    'nodes' => $nodes,
    'links' => $sankeyData,
    'plants' => $plants,
    'compounds' => $compounds,
    'proteins' => $proteins,
    'diseases' => $diseases
];

echo json_encode($response);
pg_close($conn);
