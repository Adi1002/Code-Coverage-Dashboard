import {
  DownloadOutlined, BellOutlined, BugOutlined, FolderOutlined, FileOutlined,
  FilterOutlined, WarningOutlined, ExportOutlined, CodeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined
} from '@ant-design/icons';


//Helper: Converts [8, 9, 10, 12] into "8-10, 12"
export const formatLineRanges = (lines) => {
  if (!lines || lines.length === 0) return '';
  let ranges = [];
  let start = lines[0];
  let prev = lines[0];

  for (let i = 1; i <= lines.length; i++) {
    if (lines[i] === prev + 1) {
      prev = lines[i];
    } else {
      if (start === prev) ranges.push(`${start}`);
      else ranges.push(`${start}-${prev}`);

      start = lines[i];
      prev = lines[i];
    }
  }
  return ranges.join(', ');
};

// Helper: Format Trend Text (+/-)
export const formatTrend = (trend) => trend >= 0 ? `+${trend}%` : `${trend}%`;

// Helper: Get Color based on coverage
export const getColor = (cov) => cov >= 80 ? '#22c55e' : (cov >= 50 ? '#f59e0b' : '#ef4444');

// Helper: Recursive function to build the Ant Design Tree
export const buildTreeData = (packagesArray, parentKey = '0') => {
  return packagesArray.map((pkg, index) => {
    const currentKey = `${parentKey}-${index}`;

    // 1. Recursively map sub-folders
    const childrenPackages = pkg.subpackages ? buildTreeData(pkg.subpackages, currentKey) : [];

    // 2. Map files as the "leaves" of the tree
    const childrenFiles = pkg.files ? pkg.files.map((file, fIndex) => ({
      // .split('/').pop() grabs just the file name (e.g., 'helpers.js') out of the long path!
      title: file.filename.split('/').pop(),
      key: file.filename,
      icon: <FileOutlined />,
      isLeaf: true,
      // We attach the raw coverage data to the file node so we can use it later!
      ...file
    })) : [];

    // 3. Return the Folder object containing all sub-folders and files
    return {
      title: pkg.name,
      key: currentKey,
      icon: <FolderOutlined />,
      children: [...childrenPackages, ...childrenFiles]
    };
  });
};

//Helper: Traverses the first branch of the tree to get folder keys
export const getFirstBranchKeys = (nodes, keys = []) => {
  if (!nodes || nodes.length === 0) return keys;

  const firstNode = nodes[0]; // Always grab the first item

  // If it's a folder (it has children and isn't a file leaf), save its key and go deeper!
  if (!firstNode.isLeaf && firstNode.children) {
    keys.push(firstNode.key);
    return getFirstBranchKeys(firstNode.children, keys);
  }

  return keys;
};

//Helper: Recursive function to flatten packages into a single list of files for the table
export const extractAllFiles = (packagesArray) => {
  let allFiles = [];
  packagesArray.forEach(pkg => {
    if (pkg.files) {
      const mappedFiles = pkg.files.map((file) => ({
        key: file.filename, // Use full path as a unique React key
        filename: file.filename.split('/').pop(),
        path: file.filename,
        lineCoverage: file.line_coverage,
        branchCoverage: `${file.branch_coverage}%`,
        linesCV: `${file.lines_covered} / ${file.lines_valid}`,
      }));
      allFiles = [...allFiles, ...mappedFiles];
    }
    if (pkg.subpackages) {
      allFiles = [...allFiles, ...extractAllFiles(pkg.subpackages)];
    }
  });
  return allFiles;
};