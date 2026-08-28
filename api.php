<?php
// api.php - PHP REST API endpoint

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

$db = new Database();

switch ($method) {
    case 'GET':
        handleGet($endpoint, $db);
        break;
    case 'POST':
        handlePost($endpoint, $db);
        break;
    case 'PUT':
        handlePut($endpoint, $db);
        break;
    case 'DELETE':
        handleDelete($endpoint, $db);
        break;
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGet($endpoint, $db) {
    switch ($endpoint) {
        case 'detections':
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
            $result = $db->getDetections($limit);
            echo json_encode(['success' => true, 'data' => $result]);
            break;
        case 'npk':
            $result = $db->getNPKHistory();
            echo json_encode(['success' => true, 'data' => $result]);
            break;
        case 'reports':
            $result = $db->getReports();
            echo json_encode(['success' => true, 'data' => $result]);
            break;
        case 'metrics':
            $result = $db->getMetrics();
            echo json_encode(['success' => true, 'data' => $result]);
            break;
        default:
            echo json_encode(['error' => 'Invalid endpoint']);
    }
}

function handlePost($endpoint, $db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    switch ($endpoint) {
        case 'detection':
            $result = $db->saveDetection($data);
            echo json_encode(['success' => true, 'id' => $result]);
            break;
        case 'npk':
            $result = $db->saveNPK($data);
            echo json_encode(['success' => true, 'id' => $result]);
            break;
        case 'report':
            $result = $db->saveReport($data);
            echo json_encode(['success' => true, 'id' => $result]);
            break;
        default:
            echo json_encode(['error' => 'Invalid endpoint']);
    }
}

function handlePut($endpoint, $db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    switch ($endpoint) {
        case 'detection':
            $result = $db->updateDetection($id, $data);
            echo json_encode(['success' => true, 'updated' => $result]);
            break;
        default:
            echo json_encode(['error' => 'Invalid endpoint']);
    }
}

function handleDelete($endpoint, $db) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    switch ($endpoint) {
        case 'detection':
            $result = $db->deleteDetection($id);
            echo json_encode(['success' => true, 'deleted' => $result]);
            break;
        case 'all':
            $result = $db->clearAll();
            echo json_encode(['success' => true, 'cleared' => $result]);
            break;
        default:
            echo json_encode(['error' => 'Invalid endpoint']);
    }
}
?>
